import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { randomUUID } from 'crypto';

const client = DynamoDBDocumentClient.from(new DynamoDBClient());
const sns = new SNSClient();
const TABLE_NAME = 'geolocation-test';
const SNS_TOPIC_ARN = 'arn:aws:sns:us-east-2:674482696589:geolocation-test';

export const handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    try {
        // El evento puede venir como body (API Gateway v1) o directamente como payload (v2 con payload format 2.0)
        const data = event.body 
            ? (typeof event.body === 'string' ? JSON.parse(event.body) : event.body)
            : event;
        console.log("Data: ", data)
        const id = randomUUID();
        
        console.log("Enviando a DynamoDB")
        await client.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: {
                id,
                latitude: data.latitude,
                longitude: data.longitude,
                accuracy: data.accuracy,
                timestamp: data.timestamp,
                userAgent: data.userAgent,
                sessionId: data.sessionId,
                createdAt: new Date().toISOString()
            }
        }));

        console.log("Enviando notificacion")
        // Enviar notificación SNS
        await sns.send(new PublishCommand({
            TopicArn: SNS_TOPIC_ARN,
            Subject: 'Nueva ubicación registrada',
            Message: `Ubicación: ${data.latitude}, ${data.longitude}\nPrecisión: ${data.accuracy}m\nFecha: ${new Date().toISOString()}`
        }));

        return { statusCode: 200, headers, body: JSON.stringify({ success: true, id }) };
    } catch (error) {
        console.error('Error:', error);
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    }
};
