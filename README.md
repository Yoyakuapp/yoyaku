# Yoyaku

Yoyaku is a reservation platform project for massage and wellness stores. This repository manages both the application code and the business, operation, security, infrastructure, and roadmap documentation required to run the service.

## Documentation

- [01 Project Overview](docs/01-project-overview.md)
- [02 System Architecture](docs/02-system-architecture.md)
- [03 Infrastructure](docs/03-infrastructure.md)
- [04 Cost Management](docs/04-cost-management.md)
- [05 Operation Manual](docs/05-operation-manual.md)
- [06 Security](docs/06-security.md)
- [07 Disaster Recovery](docs/07-disaster-recovery.md)
- [08 Development Guide](docs/08-development-guide.md)
- [09 Roadmap](docs/09-roadmap.md)
- [10 Business Plan](docs/10-business-plan.md)
- [11 Vision](docs/11-vision.md)
- [12 Decision Log](docs/12-decision-log.md)
- [13 AI Development Policy](docs/13-ai-development-policy.md)
- [14 Product Specification](docs/14-product-specification.md)
- [15 CI Quality Gate](docs/15-ci-quality-gate.md)
- [18 Multi-store Architecture](docs/18-multi-store-architecture.md)
- [21 Data Migration Plan](docs/21-data-migration-plan.md)
- [22 Single Completion Checklist](docs/22-single-completion-checklist.md)
- [23 Single Operations Guide](docs/23-single-operations-guide.md)
- [24 Single Test Scenarios](docs/24-single-test-scenarios.md)

## Application

The web application is built with Next.js, Prisma, Neon PostgreSQL, Stripe, and NextAuth.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to run the local development server.

## Initial Admin Account

Apply database migrations first, then create the first administrator account from an interactive shell:

```bash
npm run admin:create
```

The command prompts for Email, Name, Password, and Confirm password. Password input is hidden with `read -s`, must be at least 12 characters, and must match the confirmation. The plaintext password is never stored; only the bcrypt hash is saved to `AdminUser`, and a `StoreMember` record is created for the active single store.

Do not run this command until the target database migrations have been applied and Masa is ready to enter the first administrator password.

## Quality Checks

```bash
npm test
npm run build
npm run lint
```
