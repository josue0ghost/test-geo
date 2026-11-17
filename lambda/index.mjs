import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const client = DynamoDBDocumentClient.from(new DynamoDBClient());
const TABLE_NAME = 'geolocation-test';

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
        
        const id = randomUUID();
        
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

        return { statusCode: 200, headers, body: JSON.stringify({ success: true, id }) };
    } catch (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
    }
};
