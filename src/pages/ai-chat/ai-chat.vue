<template>
    <view class="ai-chat-page">

        <!-- 消息列表区域 -->
        <scroll-view id="scrollView" class="messages-container" scrollY="true" :scroll-top="scrollTop"
            :scroll-with-animation="true" :scroll-anchoring="true">
            <view v-if="messages.length === 0" class="welcome-section">
                <view class="welcome-avatar iconfont icon-jiqiren"></view>
                <view class="welcome-card">
                    <text class="welcome-title">欢迎使用实验室AI助手！</text>
                    <text class="welcome-content">我可以帮助您：</text>
                    <text class="welcome-item">• 解析实验计划，提取耗材需求</text>
                    <text class="welcome-item">• 分析库存状态，提供采购建议</text>
                    <text class="welcome-item">• 预警即将过期的耗材</text>
                    <text class="welcome-item">• 回答实验室管理相关问题</text>
                </view>
            </view>

            <!-- 消息列表 -->
            <view v-for="message in messages" :key="message.id" :id="'msg-' + message.id" class="message-wrapper"
                :class="message.type">
                <image v-if="
                    (message.type === 'ai' || message.type === 'system') &&
                    message.avatarUrl
                " class="message-avatar" :src="message.avatarUrl" mode="aspectFill" />
                <view v-else-if="
                    message.type === 'ai' || message.type === 'system'
                " class="message-avatar">
                    <text v-if="message.avatar" class="avatar-text" :class="message.avatar"></text>
                    <text v-else class="avatar-text iconfont icon-jiqiren"></text>
                </view>
                <image v-else-if="message.avatarUrl" class="message-avatar user" :src="message.avatarUrl"
                    mode="aspectFill" />
                <view v-else class="message-avatar user">
                    <text v-if="message.avatar" class="avatar-text">{{ message.avatar }}</text>
                    <text v-else class="avatar-text iconfont icon-yonghu"></text>
                </view>

                <view class="message-content">
                    <view class="message-bubble" :class="message.type" :is-streaming="message.isStreaming">
                        <text class="bubble-text">{{ message.content }}</text>
                        <text v-if="message.isStreaming" class="cursor">|</text>
                    </view>
                    <!-- 新增：如果 AI 返回实验计划，显示卡片式操作按钮 -->
                    <view v-if="message.aiData?.type === 'experiment_plan' && !message.isStreaming" class="plan-card">
                        <view class="plan-card-header">
                            <text class="plan-card-icon iconfont"
                                :class="message.aiData.planCreated ? 'icon-chenggong' : 'icon-wendang'"></text>
                            <text class="plan-card-title">{{
                                message.aiData.planCreated
                                    ? '实验计划已创建'
                                    : '实验计划已生成'
                            }}</text>
                        </view>
                        <view class="plan-card-info">
                            <text class="plan-card-summary">{{
                                message.aiData.planTitle ||
                                message.aiData.summary ||
                                '实验计划'
                                }}</text>
                            <text class="plan-card-items-count">共 {{ message.aiData.parsed_items?.length || 0 }}
                                项耗材</text>
                        </view>
                        <view class="plan-card-actions">
                            <view v-if="!message.aiData.planCreated" class="plan-card-btn btn-cancel"
                                @tap="handleCancelPlan(message.id)">
                                <text class="btn-text">取消</text>
                            </view>
                            <view v-if="!message.aiData.planCreated" class="plan-card-btn btn-confirm"
                                @tap="handleGoToVerify(message.aiData)">
                                <text class="btn-text">去核对</text>
                            </view>
                            <view v-if="message.aiData.planCreated" class="plan-card-btn btn-confirm"
                                @tap="handleViewPlanDetail(message.aiData.planId)">
                                <text class="btn-text">查看详情</text>
                            </view>
                        </view>
                    </view>
                    <text class="message-time">{{ message.timestamp }}</text>
                </view>
            </view>

            <view v-if="isThinking" class="message-wrapper ai">
                <view class="message-avatar">
                    <text class="avatar-text iconfont icon-jiqiren"></text>
                </view>
                <view class="message-content">
                    <view class="typing-indicator">
                        <view class="dot"></view>
                        <view class="dot"></view>
                        <view class="dot"></view>
                    </view>
                </view>
            </view>

            <!-- 底部占位 -->
            <view class="bottom-placeholder"></view>
        </scroll-view>

        <!-- 输入区域 -->
        <view class="input-container">
            <view v-if="showInput" class="input-wrapper">
                <textarea class="message-input" v-model="inputValue" :placeholder="isThinking ? 'AI 正在思考中...' : '输入您的问题...'
                    " :disabled="isThinking" :auto-height="true" :maxlength="1000" @confirm="handleSendMessage" />

                <view class="back-to-voice-button" @tap="hideInput">
                    <text class="back-to-voice-text">按住说话</text>
                </view>

                <view class="send-button" :class="{ disabled: !inputValue.trim() || isThinking }"
                    @tap="handleSendMessage">
                    <text class="send-icon iconfont"
                        :class="inputValue.trim() && !isThinking ? 'icon-fasong' : 'icon-xiaoxi'"></text>
                </view>
            </view>

            <!-- 语音按钮（默认显示） -->
            <view v-else class="voice-input-button" :class="{ recording: isRecording }" @touchstart="handleTouchStart"
                @touchend="handleTouchEnd" @touchcancel="handleTouchCancel">
                <text class="voice-button-text">
                    {{ isRecording ? `录音中 ${recordingTime}s` : '长按说话/点击输入' }}
                </text>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
    import { ref, onMounted, onUnmounted, nextTick } from 'vue'
    import { useDidShow } from '@tarojs/taro'
    import Taro from '@tarojs/taro'
    import './ai-chat.scss'
    import { BACKEND_BASE_URL } from '../../api/config'
    import { checkTokenExpired } from '../../utils/authHelper'

    // 声明微信插件类型
    declare const requirePlugin: (name: string) => any
    let plugin: any = null

    // 安全加载插件
    try {
        plugin = requirePlugin('WechatSI')
        if (!plugin) {
            console.warn('微信同声传译插件未加载')
        }
    } catch (error) {
        console.warn('插件加载失败:', error)
    }

    // 消息数据
    interface ChatMessage {
        id: string
        type: 'user' | 'ai' | 'system'
        content: string
        timestamp: string
        isStreaming?: boolean
        avatar?: string
        avatarUrl?: string
        aiData?: any // 保存 AI 原始响应数据
    }

    // 响应式数据
    const messages = ref<ChatMessage[]>([])
    const inputValue = ref('')
    const isThinking = ref(false)
    const scrollTop = ref(0)
    const userInfo = ref({
        nickname: '',
        avatar: ''
    })

    // 语音输入相关
    const showInput = ref(false)
    const isRecording = ref(false)
    const recordingTime = ref(0)
    const recordingTimer = ref<any>(null)
    const recordingMessageIndex = ref(-1)
    const touchStartTime = ref(0)
    const touchTimer = ref<any>(null)

    // 微信语音识别引擎
    let voiceEngine: any = null
    let isEngineInitialized = false

    // 初始化微信语音识别引擎
    const initVoiceEngine = () => {
        return new Promise<void>((resolve, reject) => {
            if (isEngineInitialized && voiceEngine) {
                resolve()
                return
            }

            try {
                // 检查插件是否可用
                console.log('插件对象类型:', typeof plugin)

                if (!plugin) {
                    reject(
                        new Error(
                            '微信语音识别插件未加载，请检查 app.config.ts 中的插件配置'
                        )
                    )
                    return
                }

                console.log('插件可用方法:', Object.keys(plugin))

                // 检查是否在真机环境
                const systemInfo = Taro.getSystemInfoSync()
                console.log('运行环境:', systemInfo.platform)

                if (systemInfo.platform === 'devtools') {
                    console.warn('⚠️ 微信语音识别插件仅在真机上可用')
                    reject(new Error('语音识别插件仅支持真机，请在真机上测试'))
                    return
                }

                // 获取录音识别管理器（微信官方API）
                const manager = plugin.getRecordRecognitionManager()

                if (!manager || typeof manager.start !== 'function') {
                    reject(new Error('无法获取录音管理器，插件可能未正确配置'))
                    return
                }

                console.log('✓ 录音管理器初始化成功')

                // 监听识别结果 - 使用直接赋值方式（微信插件要求）
                manager.onStart = (res: any) => {
                    console.log('✓ 语音识别开始事件触发:', res)
                    isRecording.value = true
                }

                manager.onRecognize = (res: any) => {
                    console.log('✓ 实时识别结果:', res)
                    if (recordingMessageIndex.value >= 0) {
                        messages.value[recordingMessageIndex.value].content =
                            res.result || '识别中...'
                    }
                }

                manager.onStop = (res: any) => {
                    console.log('✓ 语音识别结束事件触发:', res)
                    isRecording.value = false

                    // 停止计时器
                    if (recordingTimer.value) {
                        clearInterval(recordingTimer.value)
                        recordingTimer.value = null
                    }

                    if (recordingMessageIndex.value >= 0) {
                        const recognizedText = res.result || ''

                        if (recognizedText.trim()) {
                            messages.value[recordingMessageIndex.value].content =
                                recognizedText
                            messages.value[
                                recordingMessageIndex.value
                            ].isStreaming = false

                            // 发送给AI处理
                            setTimeout(() => {
                                processUserMessage(recognizedText)
                            }, 500)
                        } else {
                            // 没有识别到文本，删除消息
                            Taro.showToast({
                                title: '未识别到语音，请重试',
                                icon: 'none',
                                duration: 2000
                            })
                            messages.value.splice(recordingMessageIndex.value, 1)
                        }

                        recordingMessageIndex.value = -1
                    }
                }

                manager.onError = (res: any) => {
                    console.error('✗ 语音识别错误事件触发:', res)

                    // 停止计时器
                    if (recordingTimer.value) {
                        clearInterval(recordingTimer.value)
                        recordingTimer.value = null
                    }

                    if (recordingMessageIndex.value >= 0) {
                        messages.value.splice(recordingMessageIndex.value, 1)
                        recordingMessageIndex.value = -1
                    }

                    Taro.showToast({
                        title: '识别失败: ' + (res.msg || '未知错误'),
                        icon: 'none',
                        duration: 3000
                    })

                    isRecording.value = false
                }

                console.log('✓ 事件监听器已注册（使用直接赋值方式）')

                voiceEngine = manager
                isEngineInitialized = true
                resolve()
            } catch (error) {
                console.error('语音识别引擎初始化失败:', error)
                reject(error)
            }
        })
    }

    // 获取当前时间
    const getCurrentTime = () => {
        const now = new Date()
        const hours = String(now.getHours()).padStart(2, '0')
        const minutes = String(now.getMinutes()).padStart(2, '0')
        return `${hours}:${minutes}`
    }

    // 滚动到顶部（显示最新消息）
    const scrollToTop = () => {
        nextTick(() => {
            scrollTop.value = 999999
            setTimeout(() => {
                scrollTop.value = 999998
            }, 10)
        })
    }

    // 模拟流式输出
    const simulateStreamResponse = async (
        messageIndex: number,
        fullText: string
    ) => {
        const chars = fullText.split('')
        for (let i = 0; i < chars.length; i++) {
            messages.value[messageIndex].content += chars[i]

            if (i % 10 === 0) {
                await nextTick()
                scrollToTop()
            }

            await new Promise((resolve) =>
                setTimeout(resolve, 25 + Math.random() * 15)
            )
        }
        messages.value[messageIndex].isStreaming = false
        await nextTick()
        scrollToTop()
    }

    // 格式化 AI 结构化响应
    const formatAIResponse = (aiData: any): string => {
        if (!aiData) return '抱歉，我无法理解您的请求。'

        switch (aiData.type) {
            case 'experiment_plan': {
                // 简化显示，详情在卡片中
                let content = `已为您生成实验计划`
                if (aiData.summary) {
                    content += `\n\n${aiData.summary}`
                }
                content += `\n\n包含 ${aiData.parsed_items?.length || 0} 项耗材`
                return content
            }

            case 'inventory_analysis': {
                let invContent = `库存状态分析\n\n`

                if (aiData.alerts) {
                    if (aiData.alerts.expired?.length > 0) {
                        invContent += `已过期（${aiData.alerts.expired.length}项）：\n`
                        aiData.alerts.expired.forEach((item: any) => {
                            invContent += `  • ${item.name}：${item.quantity}${item.unit || ''}（${item.expiryDate}）\n`
                        })
                        invContent += `\n`
                    }

                    if (aiData.alerts.expiring_soon?.length > 0) {
                        invContent += `即将过期（${aiData.alerts.expiring_soon.length}项）：\n`
                        aiData.alerts.expiring_soon.forEach((item: any) => {
                            invContent += `  • ${item.name}：${item.quantity}${item.unit || ''}（${item.days_left}天后过期）\n`
                        })
                        invContent += `\n`
                    }

                    if (aiData.alerts.low_stock?.length > 0) {
                        invContent += `库存不足（${aiData.alerts.low_stock.length}项）：\n`
                        aiData.alerts.low_stock.forEach((item: any) => {
                            invContent += `  • ${item.name}：当前${item.current}，最小${item.min}\n`
                        })
                        invContent += `\n`
                    }

                    if (aiData.alerts.out_of_stock?.length > 0) {
                        invContent += `缺货（${aiData.alerts.out_of_stock.length}项）：\n`
                        aiData.alerts.out_of_stock.forEach((item: any) => {
                            invContent += `  • ${item.name}\n`
                        })
                        invContent += `\n`
                    }
                }

                if (aiData.recommendations?.length > 0) {
                    invContent += `建议：\n`
                    aiData.recommendations.forEach((rec: string) => {
                        invContent += `  • ${rec}\n`
                    })
                }

                if (aiData.summary) {
                    invContent += `\n${aiData.summary}`
                }

                return invContent || '当前库存状态正常'
            }

            case 'purchase_recommendation': {
                let purContent = `采购建议\n\n`
                if (aiData.summary) {
                    purContent += `${aiData.summary}\n\n`
                }
                purContent += `采购清单：\n`
                if (aiData.items && Array.isArray(aiData.items)) {
                    aiData.items.forEach((item: any) => {
                        let priorityText = '[低]'
                        if (item.priority === 'high') {
                            priorityText = '[高]'
                        } else if (item.priority === 'medium') {
                            priorityText = '[中]'
                        }
                        purContent += `${priorityText} ${item.name}\n`
                        purContent += `   当前库存：${item.current_quantity}\n`
                        purContent += `   建议采购：${item.recommended_purchase}${item.unit || ''}\n`
                        purContent += `   原因：${item.reason}\n`
                        if (item.estimated_cost) {
                            purContent += `   预估成本：¥${item.estimated_cost}\n`
                        }
                        purContent += `\n`
                    })
                }
                if (aiData.total_estimated_cost) {
                    purContent += `总预估成本：¥${aiData.total_estimated_cost}\n`
                }
                return purContent
            }

            case 'text':
                return aiData.content || ''

            default:
                // 如果是未知类型，尝试返回原始内容
                if (typeof aiData === 'string') {
                    return aiData
                }
                return JSON.stringify(aiData, null, 2)
        }
    }

    // 防止重复发送的标志位
    let isSending = false

    // 发送消息
    const handleSendMessage = async () => {
        const text = inputValue.value.trim()
        if (!text || isThinking.value || isSending) return

        // 设置发送标志，防止重复执行
        isSending = true

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: text,
            timestamp: getCurrentTime(),
            avatar: userInfo.value.nickname?.charAt(0) || 'iconfont icon-yonghu',
            avatarUrl: userInfo.value.avatar || ''
        }
        messages.value.push(userMessage)

        inputValue.value = ''

        await nextTick()
        scrollToTop()

        try {
            await processUserMessage(text)
        } finally {
            // 无论成功或失败，都清除发送标志
            isSending = false
        }
    }

    // 处理用户消息（语音和手动输入共用）
    const processUserMessage = async (text: string) => {
        isThinking.value = true

        try {
            // 获取对话历史（用于上下文）
            const conversationHistory = messages.value
                .slice(-10) // 只保留最近10条消息
                .map(msg => ({
                    role: msg.type === 'user' ? 'user' : 'assistant',
                    content: msg.content
                }))

            // 调用后端 AI API
            const response = await Taro.request({
                url: `${BACKEND_BASE_URL}/ai/chat`,
                method: 'POST',
                header: {
                    'Content-Type': 'application/json',
                    'Authorization': Taro.getStorageSync('token') || ''
                },
                data: {
                    message: text,
                    conversationHistory: conversationHistory
                }
            })

            isThinking.value = false

            if (response.statusCode === 200 && response.data.errCode === '0') {
                const aiData = response.data.data.response

                // 创建 AI 消息
                const aiMessage: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    type: 'ai',
                    content: '',
                    timestamp: getCurrentTime(),
                    avatar: 'iconfont icon-jiqiren',
                    avatarUrl: '',
                    isStreaming: true,
                    aiData: aiData // 保存原始 AI 响应数据
                }
                messages.value.push(aiMessage)

                await nextTick()
                scrollToTop()

                // 根据 AI 返回类型格式化显示
                const formattedContent = formatAIResponse(aiData)
                const messageIndex = messages.value.length - 1
                await simulateStreamResponse(messageIndex, formattedContent)
            } else {
                // API 调用失败
                // 检查是否为token过期
                if (checkTokenExpired(response.data.errorInfo)) {
                    throw new Error('Token expired')
                }

                throw new Error(response.data.errorInfo || 'AI 服务暂时不可用')
            }
        } catch (error: any) {
            console.error('AI 聊天错误:', error)
            isThinking.value = false

            // 如果是token过期错误，不再显示toast
            if (error.message === 'Token expired') {
                return
            }

            // 显示错误消息
            Taro.showToast({
                title: error.message || 'AI 服务暂时不可用',
                icon: 'none',
                duration: 3000
            })

            // 添加系统错误消息
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: 'system',
                content: `抱歉，${error.message || 'AI 服务暂时不可用，请稍后重试'}\n\n如果问题持续存在，请检查：\n1. 网络连接是否正常\n2. 后端服务是否启动\n3. DeepSeek API Key 是否正确配置`,
                timestamp: getCurrentTime(),
                avatar: 'iconfont icon-warning'
            }
            messages.value.push(errorMessage)

            await nextTick()
            scrollToTop()
        }
    }

    // 显示输入框（单击语音按钮）
    const showInputField = () => {
        if (isRecording.value) return
        showInput.value = true
    }

    // 处理触摸开始
    const handleTouchStart = () => {
        touchStartTime.value = Date.now()

        touchTimer.value = setTimeout(() => {
            startRecording()
        }, 300)
    }

    // 处理触摸结束
    const handleTouchEnd = () => {
        const touchDuration = Date.now() - touchStartTime.value

        if (touchTimer.value) {
            clearTimeout(touchTimer.value)
            touchTimer.value = null
        }

        if (isRecording.value) {
            stopRecording()
        } else if (touchDuration < 300) {
            showInputField()
        }
    }

    // 处理触摸取消
    const handleTouchCancel = () => {
        if (touchTimer.value) {
            clearTimeout(touchTimer.value)
            touchTimer.value = null
        }

        if (isRecording.value) {
            cancelRecording()
        }
    }

    // 隐藏输入框（返回语音按钮）
    const hideInput = () => {
        showInput.value = false
    }

    // 开始录音
    const startRecording = async () => {
        if (isRecording.value) return

        try {
            // 初始化语音识别引擎
            await initVoiceEngine()

            if (!voiceEngine) {
                Taro.showToast({
                    title: '语音识别初始化失败',
                    icon: 'none'
                })
                return
            }

            // 检查录音权限
            Taro.getSetting({
                success: (res) => {
                    if (!res.authSetting['scope.record']) {
                        Taro.authorize({
                            scope: 'scope.record',
                            success: () => {
                                doStartRecording()
                            },
                            fail: () => {
                                Taro.showToast({
                                    title: '需要授权录音权限',
                                    icon: 'none'
                                })
                            }
                        })
                    } else {
                        doStartRecording()
                    }
                }
            })
        } catch (error) {
            console.error('启动语音识别失败:', error)
            Taro.showToast({
                title: '语音识别启动失败',
                icon: 'none'
            })
        }
    }

    // 执行录音
    const doStartRecording = () => {
        isRecording.value = true
        recordingTime.value = 0

        const recordingMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: '正在录音...',
            timestamp: getCurrentTime(),
            avatar: userInfo.value.nickname?.charAt(0) || 'iconfont icon-yonghu',
            avatarUrl: userInfo.value.avatar || '',
            isStreaming: true
        }
        messages.value.push(recordingMessage)
        recordingMessageIndex.value = messages.value.length - 1

        nextTick(() => {
            scrollToTop()
        })

        // 添加震动反馈
        try {
            Taro.vibrateShort({
                success: () => {
                    console.log('✓ 震动反馈已触发')
                },
                fail: (err) => {
                    console.warn('震动反馈失败:', err)
                }
            })
        } catch (e) {
            console.warn('震动功能不可用:', e)
        }

        // 使用微信语音识别插件开始录音
        console.log('准备启动语音识别...')
        console.log('voiceEngine存在:', !!voiceEngine)
        console.log('voiceEngine类型:', typeof voiceEngine)
        console.log('start方法存在:', voiceEngine && typeof voiceEngine.start)

        try {
            if (!voiceEngine) {
                throw new Error('voiceEngine未初始化')
            }

            if (typeof voiceEngine.start !== 'function') {
                throw new Error('start方法不存在')
            }

            console.log('调用start方法，参数:', { lang: 'zh_CN', duration: 60000 })

            voiceEngine.start({
                lang: 'zh_CN',
                duration: 60000
            })

            console.log('✓ start方法调用成功')
        } catch (error) {
            console.error('启动语音识别失败:', error)
            Taro.showToast({
                title: '启动语音识别失败',
                icon: 'none'
            })
            cleanupRecording()
            if (recordingMessageIndex.value >= 0) {
                messages.value.splice(recordingMessageIndex.value, 1)
                recordingMessageIndex.value = -1
            }
            return
        }

        // 启动计时器
        recordingTimer.value = setInterval(() => {
            recordingTime.value++
            if (recordingTime.value >= 60) {
                stopRecording()
            }
        }, 1000)
    }

    // 清理录音状态
    const cleanupRecording = () => {
        if (recordingTimer.value) {
            clearInterval(recordingTimer.value)
            recordingTimer.value = null
        }

        isRecording.value = false
        recordingTime.value = 0
    }

    // 停止录音
    const stopRecording = () => {
        if (!isRecording.value || !voiceEngine) return

        // 添加震动反馈（停止录音时）
        try {
            Taro.vibrateShort({
                success: () => {
                    console.log('✓ 停止录音震动反馈已触发')
                }
            })
        } catch (e) {
            console.warn('震动功能不可用:', e)
        }

        // 停止语音识别引擎
        voiceEngine.stop()

        // 延迟清理状态，确保onStop回调能获取到正确的状态
        setTimeout(() => {
            cleanupRecording()
        }, 100)
    }

    // 取消录音
    const cancelRecording = () => {
        if (!isRecording.value) return

        // 添加震动反馈（取消录音时）
        try {
            Taro.vibrateShort({
                success: () => {
                    console.log('✓ 取消录音震动反馈已触发')
                }
            })
        } catch (e) {
            console.warn('震动功能不可用:', e)
        }

        if (recordingMessageIndex.value >= 0) {
            messages.value.splice(recordingMessageIndex.value, 1)
            recordingMessageIndex.value = -1
        }

        if (voiceEngine) {
            voiceEngine.stop()
        }

        setTimeout(() => {
            cleanupRecording()
        }, 100)
    }

    // 取消实验计划
    const handleCancelPlan = (messageId: string) => {
        // 可选：从列表中删除该消息或标记为已取消
        const messageIndex = messages.value.findIndex(m => m.id === messageId)
        if (messageIndex >= 0) {
            // 添加取消标记
            messages.value[messageIndex].content = '❌ 已取消此实验计划'
            messages.value[messageIndex].aiData = undefined
        }
    }

    // 去核对实验计划（跳转到创建页面）
    const handleGoToVerify = (aiData: any) => {
        if (!aiData || aiData.type !== 'experiment_plan') {
            Taro.showToast({
                title: '无效的实验计划数据',
                icon: 'none'
            })
            return
        }

        try {
            // 将 AI 数据编码为 URL 参数
            const encodedData = encodeURIComponent(JSON.stringify(aiData))

            // 导航到实验计划创建页面
            Taro.navigateTo({
                url: `/pages/collaboration/experiment-plan/experiment-plan-create?aiData=${encodedData}`
            })
        } catch (error) {
            console.error('导航失败:', error)
            Taro.showToast({
                title: '打开页面失败',
                icon: 'none'
            })
        }
    }

    // 查看实验计划详情
    const handleViewPlanDetail = (planId: string) => {
        if (!planId) {
            Taro.showToast({
                title: '无效的计划ID',
                icon: 'none'
            })
            return
        }

        try {
            // 导航到实验计划详情页面
            Taro.navigateTo({
                url: `/pages/collaboration/experiment-plan/experiment-plan-detail?id=${planId}`
            })
        } catch (error) {
            console.error('导航失败:', error)
            Taro.showToast({
                title: '打开详情失败',
                icon: 'none'
            })
        }
    }

    // 获取用户信息
    const getUserInfo = () => {
        try {
            const storedUserInfo = Taro.getStorageSync('userInfo')
            if (storedUserInfo) {
                userInfo.value = {
                    nickname: storedUserInfo.nickName || '',
                    avatar: storedUserInfo.avatar || ''
                }
            }
        } catch (e) {
            console.error('获取用户信息失败:', e)
        }
    }

    // 初始化聊天
    const initChat = () => {
        getUserInfo()

        // 初始化微信语音识别引擎
        initVoiceEngine().catch((err) => {
            console.warn('语音识别引擎初始化失败:', err)
        })
    }

    // 页面挂载
    onMounted(() => {
        initChat()
    })

    // 页面显示时滚动到顶部
    useDidShow(() => {
        if (messages.value.length > 0) {
            scrollToTop()
        }
    })

    // 监听实验计划创建完成事件
    onMounted(() => {
        Taro.eventCenter.on('experimentPlanCreated', handleExperimentPlanCreated)
    })

    // 移除事件监听
    onUnmounted(() => {
        Taro.eventCenter.off('experimentPlanCreated', handleExperimentPlanCreated)
    })

    // 处理实验计划创建完成
    const handleExperimentPlanCreated = (data: { planId: string; title: string }) => {
        console.log('收到实验计划创建事件:', data)

        // 找到对应的实验计划消息并更新状态
        messages.value.forEach((msg) => {
            if (msg.type === 'ai' && msg.aiData?.type === 'experiment_plan') {
                // 标记为已创建
                msg.aiData.planCreated = true
                msg.aiData.planId = data.planId
                msg.aiData.planTitle = data.title
            }
        })
    }
</script>
