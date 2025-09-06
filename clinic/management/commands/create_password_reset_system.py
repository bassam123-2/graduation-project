#!/usr/bin/env python3
"""
Create Password Reset System
Django management command to set up password reset functionality
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.crypto import get_random_string
from django.utils import timezone
from datetime import timedelta
import os

User = get_user_model()

class Command(BaseCommand):
    help = 'Set up password reset system for production'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            help='Email to send test password reset to'
        )
        parser.add_argument(
            '--create-templates',
            action='store_true',
            help='Create email templates for password reset'
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('🔐 Setting up Password Reset System...')
        )
        
        # Create email templates directory if it doesn't exist
        templates_dir = 'clinic/templates/emails'
        if not os.path.exists(templates_dir):
            os.makedirs(templates_dir)
            self.stdout.write(f'✅ Created templates directory: {templates_dir}')
        
        # Create password reset email template
        if options['create_templates']:
            self.create_password_reset_templates()
        
        # Test password reset functionality
        if options['email']:
            self.test_password_reset(options['email'])
        
        self.stdout.write(
            self.style.SUCCESS('🎯 Password Reset System Setup Complete!')
        )

    def create_password_reset_templates(self):
        """Create email templates for password reset"""
        
        # Password reset request template
        reset_request_template = '''<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Password Reset Request</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8f9fa; }
        .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Reset Request</h1>
        </div>
        <div class="content">
            <p>Hello {{ user.first_name }},</p>
            <p>We received a request to reset your password for your AL-BOQAI Center account.</p>
            <p>If you didn't make this request, you can safely ignore this email.</p>
            <p>To reset your password, click the button below:</p>
            <p style="text-align: center;">
                <a href="{{ reset_url }}" class="button">Reset Password</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p>{{ reset_url }}</p>
            <p>This link will expire in {{ expiry_hours }} hours for security reasons.</p>
            <p>If you have any questions, please contact our support team.</p>
        </div>
        <div class="footer">
            <p>AL-BOQAI Center - Physical Therapy & Rehabilitation</p>
            <p>This is an automated email, please do not reply.</p>
        </div>
    </div>
</body>
</html>'''
        
        # Password reset confirmation template
        reset_confirmation_template = '''<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Password Reset Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #28a745; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f8f9fa; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Password Reset Successful</h1>
        </div>
        <div class="content">
            <p>Hello {{ user.first_name }},</p>
            <p>Your password has been successfully reset.</p>
            <p>You can now log in to your account using your new password.</p>
            <p>If you didn't request this password reset, please contact our support team immediately.</p>
            <p>For security, we recommend:</p>
            <ul>
                <li>Using a strong, unique password</li>
                <li>Not sharing your password with anyone</li>
                <li>Enabling two-factor authentication if available</li>
            </ul>
        </div>
        <div class="footer">
            <p>AL-BOQAI Center - Physical Therapy & Rehabilitation</p>
            <p>This is an automated email, please do not reply.</p>
        </div>
    </div>
</body>
</html>'''
        
        # Write templates to files
        with open(f'{templates_dir}/password_reset_request.html', 'w', encoding='utf-8') as f:
            f.write(reset_request_template)
        
        with open(f'{templates_dir}/password_reset_confirmation.html', 'w', encoding='utf-8') as f:
            f.write(reset_confirmation_template)
        
        self.stdout.write('✅ Created password reset email templates')

    def test_password_reset(self, email):
        """Test password reset functionality"""
        try:
            user = User.objects.get(email=email)
            self.stdout.write(f'👤 Found user: {user.username}')
            
            # Generate reset token
            token = get_random_string(64)
            expiry = timezone.now() + timedelta(hours=2)
            
            # Create password reset record
            from clinic.models import EmailVerification
            reset_record = EmailVerification.objects.create(
                user=user,
                email=user.email,
                verification_type='password_reset',
                token=token,
                expires_at=expiry
            )
            
            self.stdout.write(f'✅ Created password reset record with token: {token[:20]}...')
            self.stdout.write(f'📧 Reset link: http://localhost:8080/reset-password/{token}/')
            
            # Clean up test record
            reset_record.delete()
            self.stdout.write('🧹 Cleaned up test record')
            
        except User.DoesNotExist:
            self.stdout.write(
                self.style.ERROR(f'❌ User with email {email} not found')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error testing password reset: {e}')
            )
