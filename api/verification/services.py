from .models import HostVerification


def approved_level_for(host) -> int:
    """Highest level reached, counting only unbroken runs of approved levels from 1 up."""
    approved = {
        step.level
        for step in host.verification_steps.filter(status=HostVerification.Status.APPROVED)
    }
    level = 0
    for candidate in (1, 2, 3, 4):
        if candidate in approved:
            level = candidate
        else:
            break
    return level
