export class QlIframeMessageService {
    static sendMessageToParent(message: any) {
        window.parent.postMessage(message, '*'); // Replace '*' with parent origin for security
    }
}