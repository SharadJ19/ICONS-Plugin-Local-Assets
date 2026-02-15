// PATH: src/app\ql-plugin\ql-default-plugin\ql-iframe-message.service.ts

export enum IframeMessageType {
    ADD_OBJECT = 'ADD_OBJECT'
}

interface BaseIframeMessage<T = any> {
    type: IframeMessageType;
    payload: T;
}

export interface AddObjectPayload {
    dataString: string;
    type: 'stickerbox';
    metaData?: Record<string, any>;
}

export type IframeMessage = BaseIframeMessage<AddObjectPayload>;

export class QlIframeMessageService {

    static sendMessageToParent(message: IframeMessage, targetOrigin: string = '*') {
        if (typeof window !== 'undefined' && window.parent) {
            window.parent.postMessage(message, targetOrigin);
        }
    }

    static sendAddObject(
        dataString: string, 
        metaData?: Record<string, any>, 
        targetOrigin: string = '*'
    ) {
        this.sendMessageToParent({
            type: IframeMessageType.ADD_OBJECT,
            payload: {
                dataString,
                type: 'stickerbox',
                metaData
            }
        }, targetOrigin);
    }
}



