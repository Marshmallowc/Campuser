<template>
	<view class="register-container">
		<view class="header">
			<view class="back-btn" @click="goBack">
				<text class="back-icon">←</text>
			</view>
			<text class="page-title">注册账号</text>
		</view>
		
		<view class="form-section">
			<view class="input-item">
				<text class="input-label">学号</text>
				<input class="input-field" type="text" v-model="studentId" placeholder="请输入学号" />
			</view>
			
			<view class="input-item">
				<text class="input-label">姓名</text>
				<input class="input-field" type="text" v-model="name" placeholder="请输入真实姓名" />
			</view>
			
			<view class="input-item">
				<text class="input-label">用户名</text>
				<input class="input-field" type="text" v-model="username" placeholder="请设置用户名" />
			</view>
			
			<view class="input-item">
				<text class="input-label">手机号</text>
				<input class="input-field" type="number" v-model="phoneNumber" placeholder="请输入手机号" maxlength="11" />
			</view>
			
			<view class="input-item">
				<text class="input-label">密码</text>
				<input class="input-field" type="password" v-model="password" placeholder="请设置密码（不少于6位）" />
			</view>
			
			<view class="input-item">
				<text class="input-label">确认密码</text>
				<input class="input-field" type="password" v-model="confirmPassword" placeholder="请再次输入密码" />
			</view>
			
			<view class="agreement">
				<checkbox :checked="isAgree" @click="isAgree = !isAgree" color="#1677ff" style="transform:scale(0.8)" />
				<text class="agreement-text">我已阅读并同意<text class="link-text">《用户协议》</text>和<text class="link-text">《隐私政策》</text></text>
			</view>
			
			<button class="register-btn" @click="handleRegister">注册</button>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue';
import { api } from '@/common/api.js';

// 获取随机默认头像
const getRandomDefaultAvatar = () => {
	// 随机生成1-13的整数
	const randomNum = Math.floor(Math.random() * 13) + 1;
	return `/static/avatar/default${randomNum}.png`;
};

const studentId = ref('');
const name = ref('');
const username = ref('');
const phoneNumber = ref('');
const password = ref('');
const confirmPassword = ref('');
const isAgree = ref(false);
const loading = ref(false);

const goBack = () => {
	uni.navigateBack();
};

const handleRegister = async () => {
	// 验证表单
	if (!studentId.value) {
		uni.showToast({
			title: '请输入学号',
			icon: 'none'
		});
		return;
	}
	
	if (!name.value) {
		uni.showToast({
			title: '请输入姓名',
			icon: 'none'
		});
		return;
	}
	
	if (!username.value) {
		uni.showToast({
			title: '请设置用户名',
			icon: 'none'
		});
		return;
	}
	
	if (!phoneNumber.value) {
		uni.showToast({
			title: '请输入手机号',
			icon: 'none'
		});
		return;
	}
	
	if (!/^1\d{10}$/.test(phoneNumber.value)) {
		uni.showToast({
			title: '请输入正确的手机号',
			icon: 'none'
		});
		return;
	}
	
	if (!password.value) {
		uni.showToast({
			title: '请设置密码',
			icon: 'none'
		});
		return;
	}
	
	if (password.value.length < 6) {
		uni.showToast({
			title: '密码不能少于6位',
			icon: 'none'
		});
		return;
	}
	
	if (password.value !== confirmPassword.value) {
		uni.showToast({
			title: '两次输入的密码不一致',
			icon: 'none'
		});
		return;
	}
	
	if (!isAgree.value) {
		uni.showToast({
			title: '请阅读并同意用户协议和隐私政策',
			icon: 'none'
		});
		return;
	}
	
	// 注册逻辑
	loading.value = true;
	uni.showLoading({
		title: '注册中...'
	});
	
	try {
		// 生成随机默认头像
		const randomAvatar = getRandomDefaultAvatar();
		console.log('为新注册用户分配随机头像:', randomAvatar);
		
		// 调用注册API，添加头像字段
		const result = await api.auth.register({
			studentId: studentId.value,
			name: name.value,
			username: username.value,
			phone: phoneNumber.value,
			password: password.value,
			avatar: randomAvatar // 添加随机头像
		});
		
		// 注册成功
		if (result.code === 200) {
		uni.hideLoading();
		uni.showToast({
			title: '注册成功',
			icon: 'success',
			duration: 1500,
			success: () => {
				// 注册成功后返回登录页面
				setTimeout(() => {
					uni.navigateBack();
				}, 1500);
			}
		});
		} else {
			// 注册失败
			uni.hideLoading();
			uni.showToast({
				title: result.message || '注册失败',
				icon: 'none'
			});
		}
	} catch (error) {
		console.error('注册异常:', error);
		uni.hideLoading();
		uni.showToast({
			title: '注册失败，请稍后重试',
			icon: 'none'
		});
	} finally {
		loading.value = false;
	}
};
</script>

<style lang="scss">
.register-container {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	padding: 40rpx;
	background-color: #ffffff;
}

.header {
	display: flex;
	align-items: center;
	margin-bottom: 60rpx;
	position: relative;
	padding-top: 20rpx;
	
	.back-btn {
		position: absolute;
		left: 0;
		top: 20rpx;
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		
		.back-icon {
			font-size: 40rpx;
			color: #333333;
		}
	}
	
	.page-title {
		width: 100%;
		text-align: center;
		font-size: 36rpx;
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
	
	.agreement {
		display: flex;
		align-items: center;
		margin: 40rpx 0;
		
		.agreement-text {
			font-size: 26rpx;
			color: #666666;
			margin-left: 10rpx;
		}
		
		.link-text {
			color: #1677ff;
		}
	}
	
	.register-btn {
		width: 100%;
		height: 90rpx;
		background: #1677ff;
		color: #ffffff;
		border-radius: 45rpx;
		font-size: 32rpx;
		font-weight: bold;
		margin-top: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
}
</style> 