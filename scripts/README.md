# Galaxy ERP Setup Scripts

This directory contains scripts to set up the Galaxy ERP system with all necessary users, roles, and permissions.

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)
```bash
npm run setup:managers
```

### Option 2: Manual Setup
```bash
# 1. Start infrastructure
docker-compose up -d

# 2. Setup database
npm run db:generate
npm run db:push

# 3. Create managers
npm run create:managers
```

## 👥 Created Manager Accounts

All managers use the password: **manager123**

| Role | Email | Access |
|------|-------|--------|
| **Inventory Manager** | inventory.manager@galaxy.com | Full inventory operations, warehouse management |
| **Purchase Manager** | purchase.manager@galaxy.com | Full procurement, supplier management |
| **CRM Manager** | crm.manager@galaxy.com | Customer relationships, leads, opportunities |
| **HR Manager** | hr.manager@galaxy.com | Employee management, departments, payroll |
| **Accountant** | accountant@galaxy.com | Financial management, chart of accounts |
| **Sales Manager** | sales.manager@galaxy.com | Sales operations, orders, quotes |
| **System Admin** | admin@galaxy.com | Full system access (password: admin123) |

## 🔐 Login Process

1. Start the development server: `npm run dev`
2. Open http://localhost:3000
3. Click "Login" or go to http://localhost:3000/login
4. Use any of the manager credentials above

## 🛠️ Script Details

### `create-managers.js`
- Creates a default tenant
- Sets up all necessary roles with proper permissions
- Creates all manager users with hashed passwords
- Provides detailed output and summary

### `setup-managers.sh`
- Automated wrapper script
- Checks database connectivity
- Runs the manager creation script
- Provides next steps guidance

## 🔧 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# Start if not running
docker-compose up -d postgres

# Test connection
npm run postgres:cli
```

### Permission Issues
```bash
# Make scripts executable
chmod +x scripts/setup-managers.sh
chmod +x scripts/create-managers.js
```

### Reset Everything
```bash
# Stop and remove containers
docker-compose down -v

# Start fresh
docker-compose up -d
npm run db:push
npm run setup:managers
```

## 📋 Role Permissions

Each role has specific permissions:

- **Inventory Manager**: Full inventory control, warehouse operations
- **Purchase Manager**: Procurement, supplier management, purchase orders
- **CRM Manager**: Customer management, lead tracking, sales pipeline
- **HR Manager**: Employee management, department structure, payroll
- **Accountant**: Financial operations, chart of accounts, reporting
- **Sales Manager**: Sales operations, order processing, customer relations
- **System Admin**: Complete system access, user management, configuration

## 🎯 Next Steps

After running the setup:

1. **Test Login**: Try logging in with different manager accounts
2. **Verify Permissions**: Check that each manager can only access their modules
3. **Customize Roles**: Modify permissions in the database if needed
4. **Add More Users**: Use the same pattern to create additional users

## 📞 Support

If you encounter issues:

1. Check the console output for specific error messages
2. Verify database connectivity: `npm run postgres:cli`
3. Ensure all dependencies are installed: `npm install --legacy-peer-deps`
4. Check Docker containers are running: `docker-compose ps`






