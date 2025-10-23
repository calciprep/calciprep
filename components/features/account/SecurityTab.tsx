"use client";

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import AnimatedButton from '@/components/ui/AnimatedButton'; // Use AnimatedButton

type PasswordInputs = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const SecurityTab: React.FC = () => {
  const { updateUserPassword, showNotification } = useAuth();
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<PasswordInputs>();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const newPasswordValue = watch('newPassword');

  const onSubmit: SubmitHandler<PasswordInputs> = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      showNotification("New passwords do not match.", "error");
      return;
    }

    setIsLoading(true);
    try {
      await updateUserPassword(data.currentPassword, data.newPassword);
      showNotification('Password updated successfully!', 'success');
      reset(); // Clear form on success
    } catch (error: any) {
      console.error("Password Update Error:", error);
      showNotification(error.message || 'Failed to update password. Check your current password.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Password Strength Logic (simplified)
  const isLongEnough = newPasswordValue && newPasswordValue.length >= 8;
  const hasUpperCase = newPasswordValue && /[A-Z]/.test(newPasswordValue);
  const hasNumberOrSymbol = newPasswordValue && /[0-9!@#$%^&*]/.test(newPasswordValue);

  const StrengthIndicator = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`text-xs ${met ? 'text-green-600' : 'text-gray-400'}`}>{text}</div>
  );

  return (
    <div className="space-y-6 p-1"> {/* Add slight padding */}
      <h3 className="text-lg font-semibold text-gray-800 pb-4 border-b border-gray-200">Change Password</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Current Password */}
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
          <div className="relative">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              id="currentPassword"
              {...register('currentPassword', { required: 'Current password is required' })}
              className={`w-full pr-10 py-2 border ${errors.currentPassword ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
            >
              {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword.message}</p>}
        </div>

        {/* New Password */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
           <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              id="newPassword"
              {...register('newPassword', {
                required: 'New password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' }
              })}
              className={`w-full pr-10 py-2 border ${errors.newPassword ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
            />
             <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
          {/* Strength Indicators */}
          <div className="flex space-x-3 mt-1">
            <StrengthIndicator met={!!isLongEnough} text="8+ chars" />
            <StrengthIndicator met={!!hasUpperCase} text="1 uppercase" />
            <StrengthIndicator met={!!hasNumberOrSymbol} text="1 number/symbol" />
          </div>
        </div>

        {/* Confirm New Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
           <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              {...register('confirmPassword', {
                required: 'Please confirm your new password',
                validate: value => value === newPasswordValue || 'Passwords do not match'
              })}
              className={`w-full pr-10 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>

        {/* Update Button */}
        <div className="pt-4 text-right">
          <AnimatedButton
            type="submit"
            disabled={isLoading}
            color="primary" // Changed to primary for consistency
            className="px-5 py-2 text-sm rounded-lg min-w-[120px]" // Added min-width
          >
            {isLoading ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> : 'Update Password'}
          </AnimatedButton>
        </div>
      </form>
    </div>
  );
};

export default SecurityTab;
