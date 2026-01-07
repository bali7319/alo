/**
 * Güvenli Logging Utility
 * Hassas bilgileri loglardan gizler
 */

/**
 * Hassas bilgileri maskele
 */
function maskSensitiveData(text: string): string {
  if (!text || typeof text !== 'string') return text;
  
  // Email maskeleme
  text = text.replace(/([a-zA-Z0-9._-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, (match, user, domain) => {
    return `${user.substring(0, 2)}***@${domain}`;
  });
  
  // Telefon numarası maskeleme (5XXXXXXXXX formatı)
  text = text.replace(/(\d{3})\d{3}(\d{4})/g, '$1***$2');
  text = text.replace(/(\+90|0)?5\d{2}\d{3}\d{4}/g, (match) => {
    return match.substring(0, 3) + '***' + match.substring(match.length - 2);
  });
  
  // Şifre maskeleme (password= veya pwd= gibi pattern'ler)
  text = text.replace(/(password|pwd|pass|secret|token|key|api[_-]?key)=([^\s&"']+)/gi, '$1=***');
  
  // Credit card maskeleme
  text = text.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '****-****-****-****');
  
  return text;
}

/**
 * Obje içindeki hassas alanları maskele
 */
function maskSensitiveFields(obj: any, sensitiveFields: string[] = []): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const defaultSensitiveFields = [
    'password',
    'pwd',
    'pass',
    'secret',
    'token',
    'apiKey',
    'api_key',
    'accessToken',
    'refreshToken',
    'phone',
    'telefon',
    'email',
    'creditCard',
    'cardNumber',
    'cvv',
    'ssn',
    'tcKimlik',
  ];
  
  const allSensitiveFields = [...defaultSensitiveFields, ...sensitiveFields];
  
  if (Array.isArray(obj)) {
    return obj.map(item => maskSensitiveFields(item, sensitiveFields));
  }
  
  const masked: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = allSensitiveFields.some(field => 
      lowerKey.includes(field.toLowerCase())
    );
    
    if (isSensitive && typeof value === 'string') {
      masked[key] = '***';
    } else if (typeof value === 'object' && value !== null) {
      masked[key] = maskSensitiveFields(value, sensitiveFields);
    } else {
      masked[key] = value;
    }
  }
  
  return masked;
}

/**
 * Güvenli console.log
 */
export function safeLog(message: string, data?: any, sensitiveFields?: string[]): void {
  const maskedMessage = maskSensitiveData(message);
  const maskedData = data ? maskSensitiveFields(data, sensitiveFields) : undefined;
  
  console.log(maskedMessage, maskedData || '');
}

/**
 * Güvenli console.error
 */
export function safeError(message: string, error?: any, sensitiveFields?: string[]): void {
  const maskedMessage = maskSensitiveData(message);
  const maskedError = error ? maskSensitiveFields(error, sensitiveFields) : undefined;
  
  console.error(maskedMessage, maskedError || '');
}

/**
 * Güvenli console.warn
 */
export function safeWarn(message: string, data?: any, sensitiveFields?: string[]): void {
  const maskedMessage = maskSensitiveData(message);
  const maskedData = data ? maskSensitiveFields(data, sensitiveFields) : undefined;
  
  console.warn(maskedMessage, maskedData || '');
}

/**
 * API request/response loglama için güvenli wrapper
 */
export function safeApiLog(
  method: string,
  path: string,
  body?: any,
  response?: any,
  statusCode?: number
): void {
  const maskedBody = body ? maskSensitiveFields(body) : undefined;
  const maskedResponse = response ? maskSensitiveFields(response) : undefined;
  
  console.log(`[API] ${method} ${path}`, {
    body: maskedBody,
    response: maskedResponse,
    status: statusCode,
  });
}

