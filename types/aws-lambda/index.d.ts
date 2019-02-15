/* tslint:disable */
import {CognitoUserPoolTriggerEvent} from 'aws-lambda';

declare module 'aws-lambda' {
    interface CognitoUserPoolTriggerEventAugmented extends CognitoUserPoolTriggerEvent{
        response: {
            autoConfirmUser?: boolean;
            autoVerifyEmail?:boolean;
            smsMessage?: string;
            emailMessage?: string;
            emailSubject?: string;
            challengeName?: string;
            issueTokens?: boolean;
            failAuthentication?: boolean;
            publicChallengeParameters?: {[key: string]: string};
            privateChallengeParameters?: {[key: string]: string};
            challengeMetaData?: string;
            answerCorrect?: boolean;

        };
    }
}

