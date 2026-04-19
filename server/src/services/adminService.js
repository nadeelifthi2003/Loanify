const mongoose = require('mongoose');
const { randomUUID } = require('crypto');
const Application = require('../../models/Application');
const User = require('../../models/User');

const ROLE_OPTIONS = ['customer', 'officer', 'admin', 'manager'];
const STATUS_OPTIONS = ['active', 'disabled', 'pending'];

const seedTimestamp = () => new Date();

const seedUser = (user) => ({
    ...user,
    id: user.id || randomUUID(),
    createdAt: user.createdAt || seedTimestamp(),
    updatedAt: user.updatedAt || seedTimestamp(),
    lastActiveAt: user.lastActiveAt || seedTimestamp(),
});

const DEFAULT_USERS = [
    seedUser({
        name: 'Nadeesha Perera',
        email: 'admin@loanify.com',
        role: 'admin',
        status: 'active',
        branch: 'Head Office',
        department: 'Platform Administration',
        phone: '+94 77 555 1000',
        permissions: ['manage_users', 'view_reports', 'manage_settings'],
        notes: 'Primary platform administrator.',
        lastActiveAt: new Date(Date.now() - 15 * 60 * 1000),
    }),
    seedUser({
        name: 'Shanaka Fernando',
        email: 'ops.admin@loanify.com',
        role: 'admin',
        status: 'active',
        branch: 'Head Office',
        department: 'Risk Operations',
        phone: '+94 77 555 1021',
        permissions: ['manage_users', 'view_reports'],
        notes: 'Monitors fraud, escalations, and service levels.',
        lastActiveAt: new Date(Date.now() - 45 * 60 * 1000),
    }),
    seedUser({
        name: 'Manager Silva',
        email: 'manager@loanify.com',
        role: 'manager',
        status: 'active',
        branch: 'Head Office',
        department: 'Loan Operations',
        phone: '+94 77 555 2000',
        permissions: ['review_applications', 'approve_high_value'],
        notes: 'Main loan manager for high-value applications.',
        lastActiveAt: new Date(Date.now() - 5 * 60 * 1000),
    }),
    seedUser({
        name: 'Kasuni Wijesinghe',
        email: 'officer.kasuni@loanify.com',
        role: 'officer',
        status: 'active',
        branch: 'Kandy',
        department: 'Loan Operations',
        phone: '+94 77 555 2022',
        permissions: ['review_applications'],
        notes: 'Top-performing verification officer.',
        lastActiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    }),
    seedUser({
        name: 'Chamara Dilshan',
        email: 'officer.chamara@loanify.com',
        role: 'officer',
        status: 'pending',
        branch: 'Galle',
        department: 'Field Verification',
        phone: '+94 77 555 2033',
        permissions: ['review_applications'],
        notes: 'Awaiting final onboarding approval.',
        lastActiveAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
    }),
    seedUser({
        name: 'Ayesha Silva',
        email: 'ayesha.silva@example.com',
        role: 'customer',
        status: 'active',
        branch: 'Colombo',
        department: 'Retail Lending',
        phone: '+94 77 555 3001',
        permissions: [],
        notes: 'Has two active borrowing products.',
        lastActiveAt: new Date(Date.now() - 30 * 60 * 1000),
    }),
    seedUser({
        name: 'Ruwan Madushanka',
        email: 'ruwan.m@example.com',
        role: 'customer',
        status: 'disabled',
        branch: 'Kurunegala',
        department: 'Retail Lending',
        phone: '+94 77 555 3002',
        permissions: [],
        notes: 'Disabled after repeated failed verification attempts.',
        lastActiveAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    }),
    seedUser({
        name: 'Sajini De Alwis',
        email: 'sajini@example.com',
        role: 'customer',
        status: 'active',
        branch: 'Negombo',
        department: 'SME Lending',
        phone: '+94 77 555 3003',
        permissions: [],
        notes: 'SME customer with strong repayment behavior.',
        lastActiveAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    }),
];

let memoryUsers = DEFAULT_USERS.map((user) => ({ ...user }));

const isDatabaseReady = () => mongoose.connection.readyState === 1;

const safeNumber = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

const formatMonthLabel = (date) =>
    date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

const getMonthBuckets = (months = 6) => {
    const current = startOfMonth(new Date());
    return Array.from({ length: months }, (_, index) => {
        const date = new Date(current.getFullYear(), current.getMonth() - (months - index - 1), 1);
        return {
            key: `${date.getFullYear()}-${date.getMonth()}`,
            label: formatMonthLabel(date),
            date,
        };
    });
};

const calculateRiskLevel = (application) => {
    const income = safeNumber(application.netMonthlyIncome || application.grossMonthlyIncome);
    const commitments = safeNumber(application.existingLoanCommitments);
    const loanAmount = safeNumber(application.loanAmount);
    const tenure = Math.max(safeNumber(application.tenure), 1);
    const monthlyExposure = loanAmount / tenure;
    const dti = income > 0 ? (commitments + monthlyExposure) / income : 1;

    if (application.status === 'Rejected' || dti >= 0.65 || loanAmount >= 1500000) {
        return 'High';
    }
    if (application.status === 'Needs Info' || dti >= 0.4 || loanAmount >= 700000) {
        return 'Medium';
    }
    return 'Low';
};

const formatUser = (user) => {
    const source = typeof user.toObject === 'function' ? user.toObject() : user;
    return {
        id: String(source._id || source.id),
        name: source.name,
        email: source.email,
        role: source.role,
        status: source.status,
        branch: source.branch || 'Head Office',
        department: source.department || 'Operations',
        phone: source.phone || '',
        notes: source.notes || '',
        permissions: Array.isArray(source.permissions) ? source.permissions : [],
        lastActiveAt: source.lastActiveAt || null,
        createdAt: source.createdAt || null,
        updatedAt: source.updatedAt || null,
    };
};

const buildUserSummary = (users) => {
    const roleCounts = users.reduce(
        (acc, user) => {
            acc[user.role] += 1;
            return acc;
        },
        { customer: 0, officer: 0, admin: 0 }
    );

    const statusCounts = users.reduce(
        (acc, user) => {
            acc[user.status] += 1;
            return acc;
        },
        { active: 0, disabled: 0, pending: 0 }
    );

    return {
        totalUsers: users.length,
        activeUsers: statusCounts.active,
        disabledUsers: statusCounts.disabled,
        pendingUsers: statusCounts.pending,
        admins: roleCounts.admin,
        officers: roleCounts.officer,
        customers: roleCounts.customer,
    };
};

const matchesUserFilters = (user, filters = {}) => {
    const search = (filters.search || '').trim().toLowerCase();
    const role = filters.role || 'all';
    const status = filters.status || 'all';

    const matchesSearch =
        !search ||
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.branch.toLowerCase().includes(search) ||
        user.department.toLowerCase().includes(search);

    const matchesRole = role === 'all' || user.role === role;
    const matchesStatus = status === 'all' || user.status === status;

    return matchesSearch && matchesRole && matchesStatus;
};

async function ensureSeedUsers() {
    if (!isDatabaseReady()) {
        return memoryUsers.map((user) => ({ ...user }));
    }

    const count = await User.countDocuments();
    if (count === 0) {
        await User.insertMany(
            DEFAULT_USERS.map((user) => ({
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                branch: user.branch,
                department: user.department,
                phone: user.phone,
                notes: user.notes,
                permissions: user.permissions,
                lastActiveAt: user.lastActiveAt,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }))
        );
    }

    return User.find({}).sort({ createdAt: -1 });
}

async function listUsers(filters = {}) {
    const users = (await ensureSeedUsers()).map(formatUser);
    const filteredUsers = users.filter((user) => matchesUserFilters(user, filters));
    return {
        users: filteredUsers,
        summary: buildUserSummary(users),
    };
}

async function createUser(payload) {
    const name = String(payload.name || '').trim();
    const email = String(payload.email || '').trim().toLowerCase();
    const role = String(payload.role || 'customer');
    const status = String(payload.status || 'pending');

    if (!name || !email) {
        throw new Error('Name and email are required.');
    }

    if (!ROLE_OPTIONS.includes(role)) {
        throw new Error('Invalid role provided.');
    }

    if (!STATUS_OPTIONS.includes(status)) {
        throw new Error('Invalid status provided.');
    }

    if (isDatabaseReady()) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error('A user with this email already exists.');
        }

        const createdUser = await User.create({
            name,
            email,
            role,
            status,
            branch: payload.branch || 'Head Office',
            department: payload.department || 'Operations',
            phone: payload.phone || '',
            notes: payload.notes || '',
            permissions: Array.isArray(payload.permissions) ? payload.permissions : [],
            lastActiveAt: new Date(),
        });

        return formatUser(createdUser);
    }

    const existingMemoryUser = memoryUsers.find((user) => user.email === email);
    if (existingMemoryUser) {
        throw new Error('A user with this email already exists.');
    }

    const newUser = seedUser({
        name,
        email,
        role,
        status,
        branch: payload.branch || 'Head Office',
        department: payload.department || 'Operations',
        phone: payload.phone || '',
        notes: payload.notes || '',
        permissions: Array.isArray(payload.permissions) ? payload.permissions : [],
        lastActiveAt: new Date(),
    });

    memoryUsers = [newUser, ...memoryUsers];
    return formatUser(newUser);
}

async function updateUserStatus(userId, status) {
    if (!STATUS_OPTIONS.includes(status)) {
        throw new Error('Invalid status provided.');
    }

    if (isDatabaseReady()) {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                status,
                updatedAt: new Date(),
                lastActiveAt: status === 'active' ? new Date() : undefined,
            },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            throw new Error('User not found.');
        }

        return formatUser(updatedUser);
    }

    const userIndex = memoryUsers.findIndex((user) => user.id === userId);
    if (userIndex === -1) {
        throw new Error('User not found.');
    }

    const updatedUser = {
        ...memoryUsers[userIndex],
        status,
        updatedAt: new Date(),
        lastActiveAt: status === 'active' ? new Date() : memoryUsers[userIndex].lastActiveAt,
    };
    memoryUsers[userIndex] = updatedUser;
    return formatUser(updatedUser);
}

async function updateUserRole(userId, role) {
    if (!ROLE_OPTIONS.includes(role)) {
        throw new Error('Invalid role provided.');
    }

    if (isDatabaseReady()) {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                role,
                updatedAt: new Date(),
            },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            throw new Error('User not found.');
        }

        return formatUser(updatedUser);
    }

    const userIndex = memoryUsers.findIndex((user) => user.id === userId);
    if (userIndex === -1) {
        throw new Error('User not found.');
    }

    const updatedUser = {
        ...memoryUsers[userIndex],
        role,
        updatedAt: new Date(),
    };
    memoryUsers[userIndex] = updatedUser;
    return formatUser(updatedUser);
}

async function loadApplications() {
    if (!isDatabaseReady()) {
        return [];
    }

    try {
        return await Application.find({}).sort({ createdAt: -1 }).lean();
    } catch (error) {
        return [];
    }
}

async function getOverview() {
    const [{ users }, applications] = await Promise.all([listUsers(), loadApplications()]);

    const approvedApplications = applications.filter((application) => application.status === 'Approved');
    const pendingApplications = applications.filter((application) => application.status === 'Pending');
    const needsInfoApplications = applications.filter((application) => application.status === 'Needs Info');
    const rejectedApplications = applications.filter((application) => application.status === 'Rejected');

    const totalPortfolio = approvedApplications.reduce(
        (sum, application) => sum + safeNumber(application.loanAmount),
        0
    );
    const recoveredAmount = approvedApplications.reduce(
        (sum, application) => sum + safeNumber(application.paidAmount),
        0
    );
    const activeBorrowers = new Set(
        approvedApplications
            .map((application) => application.nic || application.email)
            .filter(Boolean)
    ).size;

    const roleDistribution = [
        { name: 'Customers', value: users.filter((user) => user.role === 'customer').length },
        { name: 'Officers', value: users.filter((user) => user.role === 'officer').length },
        { name: 'Admins', value: users.filter((user) => user.role === 'admin').length },
    ];

    const statusDistribution = [
        { name: 'Pending', value: pendingApplications.length },
        { name: 'Approved', value: approvedApplications.length },
        { name: 'Needs Info', value: needsInfoApplications.length },
        { name: 'Rejected', value: rejectedApplications.length },
    ];

    const riskDistribution = applications.reduce(
        (acc, application) => {
            const riskLevel = calculateRiskLevel(application);
            acc[riskLevel] += 1;
            return acc;
        },
        { Low: 0, Medium: 0, High: 0 }
    );

    const trendBuckets = getMonthBuckets(6);
    const monthlyTrend = trendBuckets.map((bucket) => {
        const bucketApplications = applications.filter((application) => {
            const createdAt = application.createdAt || application.date;
            if (!createdAt) {
                return false;
            }
            const createdDate = new Date(createdAt);
            return (
                createdDate.getFullYear() === bucket.date.getFullYear() &&
                createdDate.getMonth() === bucket.date.getMonth()
            );
        });

        return {
            month: bucket.label,
            applications: bucketApplications.length,
            approved: bucketApplications.filter((application) => application.status === 'Approved').length,
            disbursed: bucketApplications
                .filter((application) => application.status === 'Approved')
                .reduce((sum, application) => sum + safeNumber(application.loanAmount), 0),
        };
    });

    const watchlist = applications
        .map((application) => {
            const riskLevel = calculateRiskLevel(application);
            return {
                id: application.id,
                applicant: application.fullName,
                amount: safeNumber(application.loanAmount),
                riskLevel,
                status: application.status,
                reason:
                    riskLevel === 'High'
                        ? 'High exposure or debt ratio detected'
                        : riskLevel === 'Medium'
                            ? 'Needs manual review before decision'
                            : 'Stable applicant profile',
            };
        })
        .filter((application) => application.riskLevel !== 'Low')
        .slice(0, 5);

    const alerts = [
        pendingApplications.length > 0
            ? {
                id: 'pending-queue',
                level: pendingApplications.length > 8 ? 'warning' : 'info',
                title: 'Approval queue needs attention',
                description: `${pendingApplications.length} applications are waiting for a credit decision.`,
            }
            : null,
        needsInfoApplications.length > 0
            ? {
                id: 'needs-info',
                level: 'warning',
                title: 'Customer follow-ups pending',
                description: `${needsInfoApplications.length} cases require additional documents or clarifications.`,
            }
            : null,
        users.filter((user) => user.status === 'disabled').length > 0
            ? {
                id: 'disabled-users',
                level: 'info',
                title: 'Disabled accounts under review',
                description: `${users.filter((user) => user.status === 'disabled').length} user accounts are currently disabled.`,
            }
            : null,
        rejectedApplications.length > approvedApplications.length && applications.length > 3
            ? {
                id: 'rejection-rate',
                level: 'warning',
                title: 'Rejection rate trending high',
                description: 'Rejected applications currently outnumber approved applications.',
            }
            : {
                id: 'platform-stable',
                level: 'success',
                title: 'Platform operations stable',
                description: 'No critical operational blockers detected in the latest admin snapshot.',
            },
    ].filter(Boolean);

    const recentActivity = [
        ...applications.slice(0, 4).map((application) => ({
            id: `application-${application.id}`,
            type: 'application',
            title: `${application.fullName} submitted ${application.loanType}`,
            description: `Request for LKR ${safeNumber(application.loanAmount).toLocaleString()} is currently ${application.status}.`,
            timestamp: application.createdAt || application.date,
        })),
        ...users.slice(0, 4).map((user) => ({
            id: `user-${user.id}`,
            type: 'user',
            title: `${user.name} is ${user.status}`,
            description: `${user.role} account in ${user.branch} branch.`,
            timestamp: user.updatedAt || user.createdAt,
        })),
    ]
        .sort((left, right) => new Date(right.timestamp) - new Date(left.timestamp))
        .slice(0, 6);

    const approvalRate =
        applications.length > 0
            ? Math.round((approvedApplications.length / applications.length) * 100)
            : 0;

    const systemHealthScore = Math.max(
        72,
        100 -
            pendingApplications.length * 2 -
            users.filter((user) => user.status === 'disabled').length * 3 -
            needsInfoApplications.length
    );

    return {
        summaryCards: [
            {
                label: 'Portfolio Value',
                value: `LKR ${totalPortfolio.toLocaleString()}`,
                helper: `${approvedApplications.length} approved loans live`,
                tone: 'primary',
            },
            {
                label: 'Pending Reviews',
                value: pendingApplications.length.toString(),
                helper: `${needsInfoApplications.length} cases need follow-up`,
                tone: pendingApplications.length > 8 ? 'warning' : 'info',
            },
            {
                label: 'Active Borrowers',
                value: activeBorrowers.toString(),
                helper: `${users.filter((user) => user.status === 'active').length} active platform users`,
                tone: 'success',
            },
            {
                label: 'Recovered Amount',
                value: `LKR ${recoveredAmount.toLocaleString()}`,
                helper: `${approvalRate}% approval conversion`,
                tone: 'primary',
            },
        ],
        hero: {
            title: 'Loanify command center',
            subtitle: 'Monitor portfolio performance, admin workload, borrower risk, and account controls from one place.',
            approvalRate,
            systemHealthScore,
            activeUsers: users.filter((user) => user.status === 'active').length,
        },
        roleDistribution,
        statusDistribution,
        riskDistribution: [
            { name: 'Low', value: riskDistribution.Low },
            { name: 'Medium', value: riskDistribution.Medium },
            { name: 'High', value: riskDistribution.High },
        ],
        monthlyTrend,
        alerts,
        watchlist,
        recentActivity,
        queue: {
            pendingApplications: pendingApplications.length,
            needsInfoApplications: needsInfoApplications.length,
            disabledUsers: users.filter((user) => user.status === 'disabled').length,
            pendingUsers: users.filter((user) => user.status === 'pending').length,
        },
    };
}

module.exports = {
    ROLE_OPTIONS,
    STATUS_OPTIONS,
    createUser,
    getOverview,
    listUsers,
    updateUserRole,
    updateUserStatus,
};
