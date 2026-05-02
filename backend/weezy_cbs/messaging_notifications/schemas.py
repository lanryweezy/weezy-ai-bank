from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from .models import ChannelEnum, NotificationStatusEnum

class NotificationLogResponse(BaseModel):
    id: int
    channel: ChannelEnum
    recipient: str
    subject: Optional[str]
    message_body: str
    status: NotificationStatusEnum
    created_at: datetime
    
    class Config:
        orm_mode = True

class SendManualNotification(BaseModel):
    customer_id: int
    channel: ChannelEnum
    message: str
    subject: Optional[str] = "WEEZY NOTIFICATION"
