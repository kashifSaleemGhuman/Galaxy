# Galaxy ERP System - Technical Implementation Plan

## Technology Stack Selection

### Frontend Framework
- **Next.js 15.5.0** with App Router
- **React 19.1.0** with TypeScript
- **Tailwind CSS 4** for styling
- **Framer Motion** for animations
- **React Hook Form** for form management
- **React Query/TanStack Query** for server state management

### Backend & Database
- **PostgreSQL 15+** as primary database
- **Prisma ORM** for database operations
- **Redis** for caching and sessions
- **NextAuth.js** for authentication
- **Zod** for schema validation

### State Management
- **Zustand** for client-side state management
- **React Query** for server state and caching
- **Context API** for theme and user preferences

### Development Tools
- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting
- **Husky** for git hooks
- **Jest** + **React Testing Library** for testing

## Folder Structure and Code Organization

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Authentication routes
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (dashboard)/             # Protected dashboard routes
│   │   ├── crm/                 # CRM module
│   │   ├── sales/               # Sales module
│   │   ├── inventory/           # Inventory module
│   │   ├── hrm/                 # HRM module
│   │   ├── accounting/          # Accounting module
│   │   └── analytics/           # Analytics & Dashboard
│   ├── api/                     # API routes
│   │   ├── auth/                # Authentication endpoints
│   │   ├── crm/                 # CRM API endpoints
│   │   ├── sales/               # Sales API endpoints
│   │   ├── inventory/           # Inventory API endpoints
│   │   ├── hrm/                 # HRM API endpoints
│   │   ├── accounting/          # Accounting API endpoints
│   │   └── analytics/           # Analytics API endpoints
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page
├── components/                   # Reusable components
│   ├── ui/                      # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Table.tsx
│   │   ├── Modal.tsx
│   │   └── ...
│   ├── forms/                   # Form components
│   ├── layout/                  # Layout components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── Navigation.tsx
│   │   └── ...
│   └── modules/                 # Module-specific components
│       ├── crm/
│       ├── sales/
│       ├── inventory/
│       ├── hrm/
│       ├── accounting/
│       └── analytics/
├── lib/                         # Utility libraries
│   ├── auth.ts                  # Authentication utilities
│   ├── db.ts                    # Database connection
│   ├── utils.ts                 # General utilities
│   ├── validations.ts           # Zod schemas
│   └── constants.ts             # Application constants
├── hooks/                       # Custom React hooks
│   ├── useAuth.ts
│   ├── useTenant.ts
│   ├── usePermissions.ts
│   └── ...
├── stores/                      # Zustand stores
│   ├── authStore.ts
│   ├── uiStore.ts
│   └── tenantStore.ts
├── types/                       # TypeScript type definitions
│   ├── auth.ts
│   ├── crm.ts
│   ├── sales.ts
│   ├── inventory.ts
│   ├── hrm.ts
│   ├── accounting.ts
│   └── common.ts
└── middleware.ts                # Next.js middleware
```

## Database Design and ORM Strategy

### Prisma Schema Design
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Core entities
model Tenant {
  id        String   @id @default(cuid())
  name      String
  domain    String?  @unique
  settings  Json     @default("{}")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  users     User[]
  customers Customer[]
  products  Product[]
  orders    Order[]
  // ... other relations
  
  @@map("tenants")
}

model User {
  id           String   @id @default(cuid())
  tenantId     String   @map("tenant_id")
  email        String   @unique
  passwordHash String   @map("password_hash")
  firstName    String   @map("first_name")
  lastName     String   @map("last_name")
  roleId       String   @map("role_id")
  isActive     Boolean  @default(true) @map("is_active")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  
  tenant       Tenant   @relation(fields: [tenantId], references: [id])
  role         Role     @relation(fields: [roleId], references: [id])
  employee     Employee?
  
  @@map("users")
}

model Role {
  id          String   @id @default(cuid())
  name        String
  description String?
  permissions Json
  users       User[]
  
  @@map("roles")
}

// CRM Module
model Customer {
  id           String   @id @default(cuid())
  tenantId     String   @map("tenant_id")
  companyName  String?  @map("company_name")
  contactPerson String? @map("contact_person")
  email        String?
  phone        String?
  address      String?
  status       String   @default("active")
  createdAt    DateTime @default(now()) @map("created_at")
  
  tenant       Tenant   @relation(fields: [tenantId], references: [id])
  leads        Lead[]
  orders       Order[]
  
  @@map("customers")
}

model Lead {
  id          String   @id @default(cuid())
  tenantId    String   @map("tenant_id")
  customerId  String?  @map("customer_id")
  title       String
  description String?
  value       Decimal? @db.Decimal(15, 2)
  stage       String   @default("new")
  assignedTo  String?  @map("assigned_to")
  createdAt   DateTime @default(now()) @map("created_at")
  
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  customer    Customer? @relation(fields: [customerId], references: [id])
  
  @@map("leads")
}

// Sales Module
model Product {
  id          String   @id @default(cuid())
  tenantId    String   @map("tenant_id")
  name        String
  sku         String?  @unique
  description String?
  price       Decimal  @db.Decimal(15, 2)
  cost        Decimal? @db.Decimal(15, 2)
  categoryId  String?  @map("category_id")
  isActive    Boolean  @default(true) @map("is_active")
  
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  
  @@map("products")
}

model Order {
  id           String   @id @default(cuid())
  tenantId     String   @map("tenant_id")
  customerId   String   @map("customer_id")
  orderNumber  String   @unique @map("order_number")
  status       String   @default("pending")
  totalAmount  Decimal  @map("total_amount") @db.Decimal(15, 2)
  createdBy    String   @map("created_by")
  createdAt    DateTime @default(now()) @map("created_at")
  
  tenant       Tenant   @relation(fields: [tenantId], references: [id])
  customer     Customer @relation(fields: [customerId], references: [id])
  
  @@map("orders")
}

// ... Additional models for other modules
```

## State Management Strategy

### Zustand Store Structure
```typescript
// stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: async (credentials) => {
        try {
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
          });
          
          if (response.ok) {
            const { user, token } = await response.json();
            set({ user, token, isAuthenticated: true });
          }
        } catch (error) {
          console.error('Login failed:', error);
          throw error;
        }
      },
      
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
      
      setUser: (user) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
```

### React Query for Server State
```typescript
// hooks/useCustomers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useCustomers = (tenantId: string) => {
  return useQuery({
    queryKey: ['customers', tenantId],
    queryFn: () => fetchCustomers(tenantId),
    enabled: !!tenantId,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};
```

## Authentication & Authorization Implementation

### NextAuth.js Configuration
```typescript
// lib/auth.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './db';
import bcrypt from 'bcryptjs';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { role: true, tenant: true },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          tenantId: user.tenantId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.tenantId = user.tenantId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.tenantId = token.tenantId;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
};
```

### Permission-Based Authorization
```typescript
// lib/permissions.ts
export const PERMISSIONS = {
  CRM: {
    CUSTOMER_READ: 'crm:customer:read',
    CUSTOMER_WRITE: 'crm:customer:write',
    CUSTOMER_DELETE: 'crm:customer:delete',
    LEAD_READ: 'crm:lead:read',
    LEAD_WRITE: 'crm:lead:write',
  },
  SALES: {
    PRODUCT_READ: 'sales:product:read',
    PRODUCT_WRITE: 'sales:product:write',
    ORDER_READ: 'sales:order:read',
    ORDER_WRITE: 'sales:order:write',
  },
  // ... other module permissions
} as const;

export const hasPermission = (userPermissions: string[], requiredPermission: string): boolean => {
  return userPermissions.includes(requiredPermission);
};

export const usePermissions = () => {
  const { user } = useAuthStore();
  
  return {
    can: (permission: string) => hasPermission(user?.role?.permissions || [], permission),
    canAny: (permissions: string[]) => permissions.some(p => hasPermission(user?.role?.permissions || [], p)),
    canAll: (permissions: string[]) => permissions.every(p => hasPermission(user?.role?.permissions || [], p)),
  };
};
```

## API Route Implementation

### CRM API Routes
```typescript
// app/api/crm/customers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { customerSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const where = {
      tenantId: session.user.tenantId,
      ...(search && {
        OR: [
          { companyName: { contains: search, mode: 'insensitive' } },
          { contactPerson: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.count({ where }),
    ]);

    return NextResponse.json({
      customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = customerSchema.parse(body);

    const customer = await prisma.customer.create({
      data: {
        ...validatedData,
        tenantId: session.user.tenantId,
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Component Architecture

### Base UI Components
```typescript
// components/ui/Button.tsx
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
```

### Module-Specific Components
```typescript
// components/modules/crm/CustomerTable.tsx
import React from 'react';
import { useCustomers } from '@/hooks/useCustomers';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { usePermissions } from '@/hooks/usePermissions';

interface CustomerTableProps {
  tenantId: string;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({ tenantId }) => {
  const { data: customersData, isLoading, error } = useCustomers(tenantId);
  const { can } = usePermissions();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading customers</div>;

  const columns = [
    { key: 'companyName', label: 'Company' },
    { key: 'contactPerson', label: 'Contact Person' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' },
  ];

  const rows = customersData?.customers.map((customer) => ({
    ...customer,
    actions: (
      <div className="flex gap-2">
        {can('crm:customer:read') && (
          <Button variant="outline" size="sm">
            View
          </Button>
        )}
        {can('crm:customer:write') && (
          <Button variant="outline" size="sm">
            Edit
          </Button>
        )}
        {can('crm:customer:delete') && (
          <Button variant="destructive" size="sm">
            Delete
          </Button>
        )}
      </div>
    ),
  }));

  return (
    <Table
      columns={columns}
      rows={rows || []}
      pagination={customersData?.pagination}
    />
  );
};
```

## Performance Optimization Strategies

### Database Optimization
- **Connection Pooling**: Use Prisma connection pooling
- **Query Optimization**: Implement proper indexing strategy
- **Read Replicas**: Use read replicas for read-heavy operations
- **Caching**: Redis caching for frequently accessed data

### Frontend Optimization
- **Code Splitting**: Dynamic imports for route-based code splitting
- **Image Optimization**: Next.js Image component with proper sizing
- **Bundle Analysis**: Regular bundle analysis and optimization
- **Lazy Loading**: Implement lazy loading for non-critical components

### API Optimization
- **Rate Limiting**: Implement rate limiting for API endpoints
- **Response Caching**: Cache API responses where appropriate
- **Pagination**: Implement proper pagination for large datasets
- **Compression**: Enable gzip compression for API responses

## Testing Strategy

### Unit Testing
- **Jest** for unit tests
- **React Testing Library** for component testing
- **MSW** for API mocking
- **Coverage targets**: 80%+ code coverage

### Integration Testing
- **Playwright** for end-to-end testing
- **API testing** with supertest
- **Database testing** with test database

### Testing Structure
```
__tests__/
├── components/           # Component tests
├── hooks/               # Hook tests
├── lib/                 # Utility tests
├── api/                 # API route tests
└── e2e/                 # End-to-end tests
```

## Deployment and CI/CD Pipeline

### Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### CI/CD Pipeline (GitHub Actions)
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
    
    - name: Run linting
      run: npm run lint
    
    - name: Build application
      run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to production
      run: |
        echo "Deploying to production..."
        # Add your deployment commands here
```

This technical implementation plan provides a solid foundation for building a scalable, maintainable ERP system. The modular architecture allows for easy development and testing, while the technology choices ensure performance and scalability. 