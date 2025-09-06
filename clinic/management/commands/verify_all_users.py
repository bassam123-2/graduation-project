from django.core.management.base import BaseCommand
from clinic.models import CustomUser

class Command(BaseCommand):
    help = 'Verify all users for development purposes'

    def handle(self, *args, **options):
        # Get all unverified users
        unverified_users = CustomUser.objects.filter(is_email_verified=False)
        
        if not unverified_users.exists():
            self.stdout.write(
                self.style.SUCCESS('All users are already verified!')
            )
            return
        
        # Verify all users
        updated_count = 0
        for user in unverified_users:
            user.is_email_verified = True
            user.is_active = True
            user.save()
            updated_count += 1
            self.stdout.write(f'Verified user: {user.username} ({user.email})')
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully verified {updated_count} users!')
        )
