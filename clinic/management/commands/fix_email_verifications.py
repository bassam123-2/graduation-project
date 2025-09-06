from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from clinic.models import EmailVerification


class Command(BaseCommand):
    help = 'Fix EmailVerification records with null expires_at values'

    def handle(self, *args, **options):
        self.stdout.write('🔧 Starting EmailVerification cleanup...')
        
        # Find records with null expires_at
        null_expires = EmailVerification.objects.filter(expires_at__isnull=True)
        count = null_expires.count()
        
        if count == 0:
            self.stdout.write(self.style.SUCCESS('✅ No records with null expires_at found.'))
            return
        
        self.stdout.write(f'📊 Found {count} records with null expires_at values.')
        
        # Set expires_at to 24 hours from creation time, or mark as expired if old
        fixed_count = 0
        expired_count = 0
        
        for verification in null_expires:
            if verification.created_at:
                # If created more than 24 hours ago, mark as expired
                if timezone.now() - verification.created_at > timedelta(hours=24):
                    verification.expires_at = verification.created_at + timedelta(hours=1)
                    expired_count += 1
                else:
                    # Set expiration to 24 hours from creation
                    verification.expires_at = verification.created_at + timedelta(hours=24)
                    fixed_count += 1
                
                verification.save()
            else:
                # If no created_at, set to current time + 24 hours
                verification.expires_at = timezone.now() + timedelta(hours=24)
                verification.save()
                fixed_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(
                f'✅ Cleanup complete! Fixed: {fixed_count}, Expired: {expired_count}'
            )
        )
