# Demo HTML5 Geolocation API con AWS

Aplicación de demostración para pruebas consensuadas de geolocalización con almacenamiento en DynamoDB.

## Arquitectura AWS

```
[Browser] → [API Gateway] → [Lambda] → [DynamoDB]
```

## Requisitos

- Navegador moderno (Safari iOS / Chrome Android)
- **HTTPS obligatorio**
- Cuenta AWS con permisos para crear recursos

---

## 1. Crear Tabla DynamoDB

```bash
aws dynamodb create-table \
    --table-name geolocation-test \
    --attribute-definitions AttributeName=id,AttributeType=S \
    --key-schema AttributeName=id,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST
```

---

## 2. Crear Rol IAM para Lambda

### Política de permisos (geolocation-lambda-policy.json):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:PutItem"
            ],
            "Resource": "arn:aws:dynamodb:*:*:table/geolocation-test"
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:*:*:*"
        }
    ]
}
```

### Crear rol:

```bash
# Crear rol con trust policy para Lambda
aws iam create-role \
    --role-name geolocation-lambda-role \
    --assume-role-policy-document '{
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Principal": {"Service": "lambda.amazonaws.com"},
            "Action": "sts:AssumeRole"
        }]
    }'

# Adjuntar política inline
aws iam put-role-policy \
    --role-name geolocation-lambda-role \
    --policy-name geolocation-dynamodb-access \
    --policy-document file://geolocation-lambda-policy.json
```

---

## 3. Crear Función Lambda

```bash
# Empaquetar código
cd lambda
zip function.zip index.mjs

# Crear función
aws lambda create-function \
    --function-name geolocation-handler \
    --runtime nodejs20.x \
    --handler index.handler \
    --role arn:aws:iam::TU-ACCOUNT-ID:role/geolocation-lambda-role \
    --zip-file fileb://function.zip
```

---

## 4. Crear API Gateway

```bash
# Crear API HTTP
aws apigatewayv2 create-api \
    --name geolocation-api \
    --protocol-type HTTP \
    --cors-configuration AllowOrigins="*",AllowMethods="POST,OPTIONS",AllowHeaders="Content-Type"

# Crear integración con Lambda (usar el API_ID devuelto)
aws apigatewayv2 create-integration \
    --api-id TU-API-ID \
    --integration-type AWS_PROXY \
    --integration-uri arn:aws:lambda:TU-REGION:TU-ACCOUNT-ID:function:geolocation-handler \
    --payload-format-version 2.0

# Crear ruta POST
aws apigatewayv2 create-route \
    --api-id TU-API-ID \
    --route-key "POST /location" \
    --target integrations/TU-INTEGRATION-ID

# Crear stage
aws apigatewayv2 create-stage \
    --api-id TU-API-ID \
    --stage-name prod \
    --auto-deploy

# Dar permiso a API Gateway para invocar Lambda
aws lambda add-permission \
    --function-name geolocation-handler \
    --statement-id apigateway-invoke \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:TU-REGION:TU-ACCOUNT-ID:TU-API-ID/*"
```

---

## 5. Configurar la App

Edita `config.js` con tu endpoint de API Gateway:

```javascript
const CONFIG = {
    REDIRECT_URL: 'https://www.google.com',
    API_ENDPOINT: 'https://TU-API-ID.execute-api.TU-REGION.amazonaws.com/prod/location',
    SESSION_ID: 'demo-' + Date.now()
};
```

---

## 6. Desplegar Frontend

### GitHub Pages:
```bash
git add .
git commit -m "Add DynamoDB integration"
git push origin main
```

### O Netlify:
Arrastra la carpeta a [app.netlify.com/drop](https://app.netlify.com/drop)

---

## Resumen de Permisos IAM Necesarios

| Permiso | Recurso | Propósito |
|---------|---------|-----------|
| `dynamodb:PutItem` | `arn:aws:dynamodb:*:*:table/geolocation-test` | Escribir ubicaciones |
| `logs:CreateLogGroup` | `arn:aws:logs:*:*:*` | Logs de Lambda |
| `logs:CreateLogStream` | `arn:aws:logs:*:*:*` | Logs de Lambda |
| `logs:PutLogEvents` | `arn:aws:logs:*:*:*` | Logs de Lambda |

---

## Ver Datos en DynamoDB

```bash
aws dynamodb scan --table-name geolocation-test
```

O en la consola AWS: **DynamoDB → Tables → geolocation-test → Explore items**

---

## Notas de Seguridad

- ⚠️ Esta app es solo para **demostraciones consensuadas**
- ⚠️ En producción, restringe CORS a tu dominio específico
- ⚠️ Considera añadir autenticación (API Key, Cognito)
- ⚠️ No uses para recopilar datos sin consentimiento explícito
