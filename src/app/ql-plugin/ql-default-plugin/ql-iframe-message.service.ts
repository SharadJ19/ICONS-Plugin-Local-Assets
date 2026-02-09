// src\app\ql-plugin\ql-default-plugin\ql-iframe-message.service.ts

export class QlIframeMessageService {
    static sendMessageToParent(message: any) {
        window.parent.postMessage(message, '*');
    }
}
