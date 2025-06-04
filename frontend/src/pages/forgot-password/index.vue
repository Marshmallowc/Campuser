<template>
	<view class="forgot-password-container">
		<view class="header">
			<view class="back-btn" @click="goBack">
				<text class="back-icon">←</text>
			</view>
			<text class="page-title">找回密码</text>
		</view>
		
		<view class="form-section">
			<view class="input-item">
				<text class="input-label">手机号</text>
				<input class="input-field" type="number" v-model="phoneNumber" placeholder="请输入手机号" maxlength="11" />
			</view>
			
			<view class="input-item verification-code">
				<text class="input-label">验证码</text>
				<view class="verification-input">
					<input class="input-field" type="text" v-model="verificationCode" placeholder="请输入验证码" />
					<button class="verification-btn" @click="sendVerificationCode" :disabled="countdown > 0">
						{{ countdown > 0 ? `${countdown}秒后重发` : '获取验证码' }}
					</button>
				</view>
			</view>
			
			<view class="input-item">
				<text class="input-label">新密码</text>
				<input class="input-field" type="password" v-model="newPassword" placeholder="请设置新密码（不少于6位）" />
			</view>
			
			<view class="input-item">
				<text class="input-label">确认密码</text>
				<input class="input-field" type="password" v-model="confirmPassword" placeholder="请再次输入密码" />
			</view>
			
			<button class="reset-btn" @click="handleResetPassword">重置密码</button>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue';

const phoneNumber = ref('');
const verificationCode = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const countdown = ref(0);
let timer = null;

const goBack = () => {
	uni.navigateBack();
};

const sendVerificationCode = () => {
	// 验证手机号
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
	
	// 发送验证码
	uni.showLoading({
		title: '发送中...'
	});
	
	// 模拟发送验证码到手机
	setTimeout(() => {
		uni.hideLoading();
		uni.showToast({
			title: '验证码已发送至手机',
			icon: 'success'
		});
		// 开始倒计时
		countdown.value = 60;
		clearInterval(timer);
		timer = setInterval(() => {
			if (countdown.value > 0) {
				countdown.value--;
			} else {
				clearInterval(timer);
			}
		}, 1000);
	}, 1000);
};

const handleResetPassword = () => {
	// 验证表单
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
	
	if (!verificationCode.value) {
		uni.showToast({
			title: '请输入验证码',
			icon: 'none'
		});
		return;
	}
	
	if (!newPassword.value) {
		uni.showToast({
			title: '请设置新密码',
			icon: 'none'
		});
		return;
	}
	
	if (newPassword.value.length < 6) {
		uni.showToast({
			title: '密码不能少于6位',
			icon: 'none'
		});
		return;
	}
	
	if (newPassword.value !== confirmPassword.value) {
		uni.showToast({
			title: '两次输入的密码不一致',
			icon: 'none'
		});
		return;
	}
	
	// 提交重置密码请求
	uni.showLoading({
		title: '提交中...'
	});
	
	// 模拟重置密码请求
	setTimeout(() => {
		uni.hideLoading();
		uni.showToast({
			title: '密码重置成功',
			icon: 'success',
			duration: 1500,
			success: () => {
				// 重置成功后返回登录页面
				setTimeout(() => {
					uni.navigateBack();
				}, 1500);
			}
		});
	}, 1500);
};
</script>

<style lang="scss">
.forgot-password-container {
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
	
	.verification-code {
		.verification-input {
			display: flex;
			align-items: center;
			
			.input-field {
				flex: 1;
			}
			
			.verification-btn {
				width: 220rpx;
				height: 90rpx;
				background: #1677ff;
				color: #ffffff;
				border-radius: 45rpx;
				font-size: 28rpx;
				margin-left: 20rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				padding: 0;
				white-space: nowrap;
				
				&[disabled] {
					background: #cccccc;
				}
			}
		}
	}
	
	.reset-btn {
		width: 100%;
		height: 90rpx;
		background: #1677ff;
		color: #ffffff;
		border-radius: 45rpx;
		font-size: 32rpx;
		font-weight: bold;
		margin-top: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
}
</style> 