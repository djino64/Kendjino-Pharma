# pylint: disable=no-member

import random
from django.core.mail import send_mail
from django.conf import settings

from .models import OTPCode, AuditLog


def generate_otp(user):
    """Génère un OTP unique pour un utilisateur"""
    OTPCode.objects.filter(user=user, is_used=False).update(is_used=True)

    code = str(random.randint(100000, 999999))

    OTPCode.objects.create(
        user=user,
        code=code,
        is_used=False
    )

    return code


def send_otp_email(user, code):
    """Envoie le code OTP par email"""
    subject = "Kendjino Pharma — Réinitialisation mot de passe"

    message = f"""
Bonjour {user.get_full_name()},

Votre code OTP pour réinitialiser votre mot de passe est :

    {code}

Ce code expire dans {settings.OTP_EXPIRY_MINUTES} minutes.

Si vous n'avez pas fait cette demande, ignorez cet email.

Kendjino Pharma
"""

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False
    )


def log_action(user, action, model_name='', object_id=None, details=None, ip=None):
    """Enregistre une action dans l'audit log"""
    AuditLog.objects.create(
        user=user,
        action=action,
        model_name=model_name,
        object_id=object_id,
        details=details or {},
        ip_address=ip,
    )