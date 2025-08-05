import logging
import time
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

# Configure logging
logger = logging.getLogger('monitoring')

def log_performance_data(operation, duration, details=None):
    """Log performance data for operations"""
    try:
        log_data = {
            'operation': operation,
            'duration': duration,
            'details': details or {}
        }
        logger.info(f"Performance data: {log_data}")
    except Exception as e:
        logger.error(f"Error logging performance data: {e}")

def log_user_activity(user, action, details=None):
    """Log user activity"""
    try:
        log_data = {
            'user_id': user.id if user else None,
            'username': user.username if user else 'anonymous',
            'action': action,
            'details': details or {}
        }
        logger.info(f"User activity: {log_data}")
    except Exception as e:
        logger.error(f"Error logging user activity: {e}")

def track_cache_operation(operation, hit):
    """Track cache operations"""
    try:
        log_data = {
            'operation': operation,
            'cache_hit': hit
        }
        logger.info(f"Cache operation: {log_data}")
    except Exception as e:
        logger.error(f"Error tracking cache operation: {e}")

@api_view(['GET'])
@permission_classes([AllowAny])
def system_status(request):
    """Get system status information"""
    try:
        status_data = {
            'status': 'healthy',
            'timestamp': time.time(),
            'version': '1.0.0',
            'services': {
                'database': 'operational',
                'cache': 'operational',
                'api': 'operational'
            }
        }
        return Response(status_data, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error getting system status: {e}")
        return Response(
            {'error': 'Failed to get system status'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([AllowAny])
def performance_metrics(request):
    """Get performance metrics"""
    try:
        metrics_data = {
            'timestamp': time.time(),
            'metrics': {
                'uptime': 'operational',
                'response_time': 'normal',
                'memory_usage': 'normal'
            }
        }
        return Response(metrics_data, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error getting performance metrics: {e}")
        return Response(
            {'error': 'Failed to get performance metrics'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        ) 