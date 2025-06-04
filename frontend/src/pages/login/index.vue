<template>
	<view class="login-container">
		<view class="logo-section">
			<image class="logo" src="/static/logo.png" mode="aspectFit"></image>
			<text class="app-name">速问</text>
		</view>
		
		<view class="form-section">
			<view class="input-item">
				<text class="input-label">手机号</text>
				<input class="input-field" type="number" v-model="phone" placeholder="请输入手机号" maxlength="11" />
			</view>
			
			<view class="input-item">
				<text class="input-label">密码</text>
				<input class="input-field" type="password" v-model="password" placeholder="请输入密码" />
			</view>
			
			<button class="login-btn" @click="handleLogin" :disabled="loading">{{ loading ? '登录中...' : '登录' }}</button>
			
			<view class="actions">
				<text class="action-link" @click="goToRegister">注册账号</text>
				<text class="action-link" @click="forgotPassword">忘记密码</text>
			</view>
		</view>
		
		<view class="footer">
			<text class="footer-text">登录即代表同意《用户协议》和《隐私政策》</text>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue';
import { api } from '@/common/api.js';
import { store } from '@/common/store.js';

// 表单数据
const phone = ref('');
const password = ref('');
const loading = ref(false);

// 验证手机号格式
const isValidPhone = (phone) => {
	const phoneRegex = /^1[3-9]\d{9}$/;
	return phoneRegex.test(phone);
};

// 登录处理
const handleLogin = async () => {
	// 表单验证
	if (!phone.value) {
		uni.showToast({
			title: '请输入手机号',
			icon: 'none'
		});
		return;
	}
	
	if (!isValidPhone(phone.value)) {
		uni.showToast({
			title: '手机号格式不正确',
			icon: 'none'
		});
		return;
	}
	
	if (!password.value) {
		uni.showToast({
			title: '请输入密码',
			icon: 'none'
		});
		return;
	}
	
	// 登录逻辑
	loading.value = true;
	try {
		// 调用登录API
		const result = await api.auth.login({
			phone: phone.value, // 使用phone字段发送手机号
			password: password.value
		});
		
		// 登录成功
		if (result.code === 200) {
			// 保存token和用户数据
			uni.setStorageSync('token', result.data.token);
			uni.setStorageSync('userId', result.data.userId);
			
			// 更新用户资料
			if (result.data.userProfile) {
				store.userProfile = result.data.userProfile;
				store.saveUserProfile();
			}
			
			// 初始化数据
			await store.init();
			
			// 检查并更新默认头像
			console.log('登录成功，检查并更新默认头像');
			const avatarResult = await store.checkAndUpdateDefaultAvatar();
			console.log('头像检查结果:', avatarResult);
			
			// 显示成功提示
			uni.showToast({
				title: '登录成功',
				icon: 'success',
				duration: 1500
			});
			
			// 登录成功后跳转到首页
			setTimeout(() => {
				uni.reLaunch({
					url: '/pages/index/index'
				});
			}, 1500);
		} else {
			// 登录失败
			uni.showToast({
				title: result.message || '登录失败，请检查手机号和密码',
				icon: 'none'
			});
		}
	} catch (error) {
		console.error('登录异常:', error);
		uni.showToast({
			title: '登录失败，请稍后重试',
			icon: 'none'
		});
	} finally {
		loading.value = false;
	}
};

// 跳转到注册页面
const goToRegister = () => {
	try {
		uni.navigateTo({
			url: '../register/index'
		});
	} catch (error) {
		console.error('跳转注册页面失败:', error);
		uni.showToast({
			title: '跳转失败，请重试',
			icon: 'none'
		});
	}
};

// 跳转到忘记密码页面
const forgotPassword = () => {
	try {
		uni.navigateTo({
			url: '../forgot-password/index'
		});
	} catch (error) {
		console.error('跳转找回密码页面失败:', error);
		uni.showToast({
			title: '跳转失败，请重试',
			icon: 'none'
		});
	}
};
</script>

<style lang="scss">
.login-container {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	padding: 40rpx;
	background-color: #ffffff;
}

.logo-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-top: 80rpx;
	margin-bottom: 60rpx;
	
	.logo {
		width: 160rpx;
		height: 160rpx;
	}
	
	.app-name {
		margin-top: 30rpx;
		font-size: 48rpx;
		font-weight: bold;
		color: #333333;
	}
}

.form-section {
	width: 100%;
	
	.input-item {
		margin-bottom: 30rpx;
		
		.input-label {
			display: block;
			font-size: 28rpx;
			color: #666666;
			margin-bottom: 10rpx;
		}
		
		.input-field {
			width: 100%;
			height: 90rpx;
			background-color: #f5f5f5;
			border-radius: 45rpx;
			padding: 0 30rpx;
			font-size: 30rpx;
			box-sizing: border-box;
		}
	}
	
	.login-btn {
		width: 100%;
		height: 90rpx;
		background: #1677ff;
		color: #ffffff;
		border-radius: 45rpx;
		font-size: 32rpx;
		font-weight: bold;
		margin-top: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		
		&:disabled {
			background: #99c0ff;
			color: #ffffff;
		}
	}
	
	.actions {
		display: flex;
		justify-content: space-between;
		margin-top: 30rpx;
		
		.action-link {
			font-size: 26rpx;
			color: #1677ff;
		}
	}
}

.footer {
	margin-top: auto;
	padding: 30rpx 0;
	text-align: center;
	
	.footer-text {
		font-size: 24rpx;
		color: #999999;
	}
}
</style> 