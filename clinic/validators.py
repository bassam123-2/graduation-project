"""
Password Validation System
Comprehensive password validation for production security
"""
import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _

class PasswordValidator:
    """
    Comprehensive password validator with multiple complexity requirements
    """
    
    def __init__(self, min_length=8, require_uppercase=True, require_lowercase=True,
                 require_digits=True, require_special=True, max_length=128):
        self.min_length = min_length
        self.max_length = max_length
        self.require_uppercase = require_uppercase
        self.require_lowercase = require_lowercase
        self.require_digits = require_digits
        self.require_special = require_special
    
    def validate(self, password, user=None):
        """
        Validate password against all requirements
        """
        errors = []
        
        # Check length
        if len(password) < self.min_length:
            errors.append(
                _('Password must be at least %(min_length)d characters long.') % 
                {'min_length': self.min_length}
            )
        
        if len(password) > self.max_length:
            errors.append(
                _('Password must be no more than %(max_length)d characters long.') % 
                {'max_length': self.max_length}
            )
        
        # Check character requirements
        if self.require_uppercase and not re.search(r'[A-Z]', password):
            errors.append(_('Password must contain at least one uppercase letter.'))
        
        if self.require_lowercase and not re.search(r'[a-z]', password):
            errors.append(_('Password must contain at least one lowercase letter.'))
        
        if self.require_digits and not re.search(r'\d', password):
            errors.append(_('Password must contain at least one digit.'))
        
        if self.require_special and not re.search(r'[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]', password):
            errors.append(_('Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?).'))
        
        # Check for common weak patterns
        if self._is_common_password(password):
            errors.append(_('This password is too common. Please choose a more unique password.'))
        
        if self._has_sequential_chars(password):
            errors.append(_('Password contains sequential characters (e.g., 123, abc). Please avoid patterns.'))
        
        if self._has_repeated_chars(password):
            errors.append(_('Password contains too many repeated characters. Please use more variety.'))
        
        # Check for personal information (if user is provided)
        if user:
            if self._contains_personal_info(password, user):
                errors.append(_('Password should not contain personal information like username or email.'))
        
        if errors:
            raise ValidationError(errors)
    
    def _is_common_password(self, password):
        """Check if password is in common password list"""
        common_passwords = {
            'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
            'admin', 'letmein', 'welcome', 'monkey', 'dragon', 'master', 'hello',
            'freedom', 'whatever', 'qazwsx', 'trustno1', 'jordan', 'harley',
            'ranger', 'iwantu', 'jennifer', 'hunter', 'buster', 'soccer',
            'harley', 'batman', 'andrew', 'tigger', 'sunshine', 'iloveyou',
            'fuckyou', '2000', 'charlie', 'robert', 'thomas', 'hockey',
            'ranger', 'daniel', 'starwars', 'klaster', '112233', 'george',
            'computer', 'michelle', 'jessica', 'pepper', '1111', 'zxcvbn',
            '555555', '11111111', '131313', 'freedom', '7777777', 'pass',
            'maggie', '159753', 'aaaaaa', 'ginger', 'princess', 'joshua',
            'cheese', 'amanda', 'summer', 'love', 'ashley', 'nicole',
            'chelsea', 'biteme', 'matthew', 'access', 'yankees', '987654321',
            'dallas', 'austin', 'thunder', 'taylor', 'matrix', 'mobilemail',
            'mom', 'monitor', 'monitoring', 'montana', 'moon', 'moscow'
        }
        return password.lower() in common_passwords
    
    def _has_sequential_chars(self, password):
        """Check for sequential characters"""
        # Check for sequential numbers
        for i in range(len(password) - 2):
            if (password[i].isdigit() and password[i+1].isdigit() and password[i+2].isdigit()):
                if (int(password[i+1]) == int(password[i]) + 1 and 
                    int(password[i+2]) == int(password[i+1]) + 1):
                    return True
        
        # Check for sequential letters
        for i in range(len(password) - 2):
            if (password[i].isalpha() and password[i+1].isalpha() and password[i+2].isalpha()):
                if (ord(password[i+1].lower()) == ord(password[i].lower()) + 1 and 
                    ord(password[i+2].lower()) == ord(password[i+1].lower()) + 1):
                    return True
        
        return False
    
    def _has_repeated_chars(self, password):
        """Check for too many repeated characters"""
        for char in password:
            if password.count(char) > len(password) * 0.3:  # More than 30% repeated
                return True
        return False
    
    def _contains_personal_info(self, password, user):
        """Check if password contains personal information"""
        personal_info = [
            user.username.lower(),
            user.email.lower().split('@')[0],  # Email username part
            user.first_name.lower() if user.first_name else '',
            user.last_name.lower() if user.last_name else '',
        ]
        
        password_lower = password.lower()
        for info in personal_info:
            if info and info in password_lower:
                return True
        return False
    
    def get_help_text(self):
        """Return help text for password requirements"""
        requirements = []
        
        requirements.append(f'Your password must be at least {self.min_length} characters long.')
        
        if self.require_uppercase:
            requirements.append('contain at least one uppercase letter (A-Z)')
        
        if self.require_lowercase:
            requirements.append('contain at least one lowercase letter (a-z)')
        
        if self.require_digits:
            requirements.append('contain at least one digit (0-9)')
        
        if self.require_special:
            requirements.append('contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)')
        
        requirements.append('not be a common password')
        requirements.append('not contain sequential characters (123, abc)')
        requirements.append('not contain too many repeated characters')
        requirements.append('not contain personal information')
        
        return ' '.join(requirements) + '.'

# Pre-configured validators for different security levels
class BasicPasswordValidator(PasswordValidator):
    """Basic password requirements for general use"""
    def __init__(self):
        super().__init__(
            min_length=8,
            require_uppercase=True,
            require_lowercase=True,
            require_digits=True,
            require_special=False
        )

class StrongPasswordValidator(PasswordValidator):
    """Strong password requirements for sensitive accounts"""
    def __init__(self):
        super().__init__(
            min_length=10,
            require_uppercase=True,
            require_lowercase=True,
            require_digits=True,
            require_special=True
        )

class AdminPasswordValidator(PasswordValidator):
    """Admin-level password requirements for administrative accounts"""
    def __init__(self):
        super().__init__(
            min_length=12,
            require_uppercase=True,
            require_lowercase=True,
            require_digits=True,
            require_special=True
        )

# Password strength calculator
def calculate_password_strength(password):
    """
    Calculate password strength score (0-100)
    """
    score = 0
    
    # Length bonus
    if len(password) >= 8:
        score += 20
    if len(password) >= 12:
        score += 10
    if len(password) >= 16:
        score += 10
    
    # Character variety bonus
    if re.search(r'[a-z]', password):
        score += 10
    if re.search(r'[A-Z]', password):
        score += 10
    if re.search(r'\d', password):
        score += 10
    if re.search(r'[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]', password):
        score += 15
    
    # Complexity bonus
    if len(set(password)) > len(password) * 0.7:  # Good character variety
        score += 10
    
    # Penalties
    if len(password) < 8:
        score -= 20
    if re.search(r'(.)\1{2,}', password):  # 3+ repeated characters
        score -= 15
    if re.search(r'(123|abc|qwe)', password.lower()):
        score -= 20
    
    return max(0, min(100, score))

def get_password_strength_label(score):
    """Get human-readable password strength label"""
    if score >= 80:
        return "Very Strong"
    elif score >= 60:
        return "Strong"
    elif score >= 40:
        return "Moderate"
    elif score >= 20:
        return "Weak"
    else:
        return "Very Weak"
