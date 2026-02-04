# Security Policy

[English](SECURITY.md) | [中文](SECURITY_zh-CN.md)

### Supported Versions

Currently supported versions for security updates:

| Version | Supported |
| ------ | -------- |
| 0.1.x  | ✅ Supported |

### Reporting a Vulnerability

If you discover a security vulnerability, please do not report it publicly. Please report it privately via:

**Email**: code@xtenzin.com

Please include in your email:

- Detailed description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Time

We commit to:

- Acknowledge receipt of your report within **24 hours**
- Provide initial assessment within **72 hours**
- Provide fix or update within **7 days**

### Security Best Practices

When using this tool, please follow these security best practices:

1. **API KEY Security**
   - Do not hardcode API KEY in code
   - Use environment variables or secure configuration management
   - Rotate API KEY regularly

2. **Connection Security**
   - Use HTTPS connection to Qdrant server
   - Verify server certificates
   - Do not transmit sensitive data on public networks

3. **Data Security**
   - Regularly backup important data
   - Limit access permissions
   - Monitor unusual activities

### Known Security Issues

There are currently no known security issues.
