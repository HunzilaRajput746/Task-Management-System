import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import ActivityLog from '../models/ActivityLog.js';
import { connectDB, closeDB } from '../config/db.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    console.log('Clearing existing database collections...');
    await User.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();
    await ActivityLog.deleteMany();

    console.log('Seeding enterprise demo users...');
    const users = await User.create([
      {
        name: 'Alexander Vance',
        email: 'admin@pulse.io',
        password: 'Password123!',
        role: 'admin',
        title: 'Chief Technology Officer',
        department: 'Executive Engineering',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        status: 'active',
      },
      {
        name: 'Sarah Jenkins',
        email: 'manager@pulse.io',
        password: 'Password123!',
        role: 'manager',
        title: 'Staff Product Architect',
        department: 'Product Management',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
        status: 'active',
      },
      {
        name: 'David Chen',
        email: 'member@pulse.io',
        password: 'Password123!',
        role: 'member',
        title: 'Senior Full-Stack Engineer',
        department: 'Platform Core',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        status: 'active',
      },
      {
        name: 'Elena Rostova',
        email: 'elena@pulse.io',
        password: 'Password123!',
        role: 'member',
        title: 'Lead UI/UX Designer',
        department: 'Design Systems',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        status: 'active',
      },
      {
        name: 'Marcus Brody',
        email: 'marcus@pulse.io',
        password: 'Password123!',
        role: 'member',
        title: 'Senior Cloud Security Lead',
        department: 'Security & Compliance',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        status: 'away',
      },
      {
        name: 'Priya Sharma',
        email: 'priya@pulse.io',
        password: 'Password123!',
        role: 'member',
        title: 'SRE & Quality Automation Lead',
        department: 'DevOps & Reliability',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        status: 'active',
      },
    ]);

    const [admin, manager, dev1, designer, security, sre] = users;

    console.log('Seeding enterprise projects...');
    const projects = await Project.create([
      {
        title: 'Cloud Infrastructure & Zero-Trust Migration',
        key: 'INFRA',
        description:
          'Migrate core workloads from legacy monolithic cluster to multi-region Kubernetes with zero-trust network policies, automated secrets rotation via HashiCorp Vault, and continuous health telemetry.',
        category: 'DevOps',
        status: 'in_progress',
        priority: 'high',
        manager: manager._id,
        members: [manager._id, dev1._id, security._id, sre._id],
        startDate: new Date('2026-08-01'),
        dueDate: new Date('2026-10-31'),
        budget: 145000,
        tags: ['Kubernetes', 'Zero-Trust', 'Terraform', 'Vault'],
        color: '#6366F1',
      },
      {
        title: 'Pulse Design System & Next-Gen Dashboard',
        key: 'PULSE',
        description:
          'Implement atomic design tokens, high-density charts, and accessible WCAG 2.1 AA compliant components across client interfaces with Tailwind CSS and Framer Motion micro-interactions.',
        category: 'Design',
        status: 'in_progress',
        priority: 'urgent',
        manager: manager._id,
        members: [manager._id, designer._id, dev1._id],
        startDate: new Date('2026-08-15'),
        dueDate: new Date('2026-11-15'),
        budget: 85000,
        tags: ['TailwindCSS', 'DesignSystem', 'React', 'A11y'],
        color: '#EC4899',
      },
      {
        title: 'SOC2 Type II Security Compliance & Audit',
        key: 'SEC',
        description:
          'Formalize automated access review routines, end-to-end audit logging pipelines, and container vulnerability scanning gates in preparation for third-party AICPA SOC2 certification.',
        category: 'Security',
        status: 'in_progress',
        priority: 'high',
        manager: admin._id,
        members: [admin._id, security._id, sre._id],
        startDate: new Date('2026-07-01'),
        dueDate: new Date('2026-12-01'),
        budget: 110000,
        tags: ['SOC2', 'Compliance', 'Audit', 'Encryption'],
        color: '#F59E0B',
      },
      {
        title: 'AI Customer Insight & Telemetry Pipeline',
        key: 'DATA',
        description:
          'Build streaming event ingestion pipeline with Kafka and ClickHouse to generate real-time user retention cohorts, churn anomaly detection, and automated customer sentiment scoring.',
        category: 'Engineering',
        status: 'planning',
        priority: 'medium',
        manager: manager._id,
        members: [manager._id, dev1._id, sre._id],
        startDate: new Date('2026-09-01'),
        dueDate: new Date('2027-01-20'),
        budget: 160000,
        tags: ['Kafka', 'ClickHouse', 'MachineLearning', 'Analytics'],
        color: '#10B981',
      },
    ]);

    const [infraProj, pulseProj, secProj, dataProj] = projects;

    console.log('Seeding realistic tasks with checklists and discussions...');
    const tasks = [
      // INFRA Project Tasks
      {
        title: 'Draft Infrastructure as Code for Multi-Region VPC Peering',
        taskCode: 'INFRA-101',
        description:
          'Define Terraform modules for cross-region transit gateway, VPC CIDR allocations, and redundant egress NAT gateways with automated health checks.',
        project: infraProj._id,
        assignee: sre._id,
        creator: manager._id,
        status: 'completed',
        priority: 'high',
        dueDate: new Date('2026-09-10'),
        estimatedHours: 16,
        actualHours: 14,
        tags: ['Terraform', 'VPC', 'Networking'],
        checklists: [
          { title: 'Subnet CIDR range validation', completed: true },
          { title: 'Transit gateway route tables configured', completed: true },
          { title: 'Terraform plan review by SecOps', completed: true },
        ],
        comments: [
          {
            user: sre._id,
            text: 'Terraform modules tested in us-east-1 and eu-west-1 staging accounts. Zero routing conflicts observed.',
          },
          {
            user: manager._id,
            text: 'Approved! Terratest validation passed cleanly in the CI pipeline.',
          },
        ],
      },
      {
        title: 'Integrate HashiCorp Vault Agent Sidecars for Dynamic DB Credentials',
        taskCode: 'INFRA-102',
        description:
          'Configure Kubernetes mutation webhooks to inject Vault Agent sidecars, leasing ephemeral database roles with 1-hour TTLs.',
        project: infraProj._id,
        assignee: dev1._id,
        creator: manager._id,
        status: 'in_progress',
        priority: 'urgent',
        dueDate: new Date('2026-09-24'),
        estimatedHours: 20,
        actualHours: 12,
        tags: ['Kubernetes', 'Vault', 'Security'],
        checklists: [
          { title: 'Deploy Vault helm chart to staging', completed: true },
          { title: 'Configure Kubernetes Auth Method', completed: true },
          { title: 'Write secret leasing lease revocation test', completed: false },
        ],
        comments: [
          {
            user: dev1._id,
            text: 'Vault agent auto-auth is working against the staging cluster. Now configuring lease renewal daemon.',
          },
        ],
      },
      {
        title: 'Implement Istio mTLS Strict Enforce Mode Across Namespaces',
        taskCode: 'INFRA-103',
        description:
          'Roll out PeerAuthentication resource with STRICT mode to enforce bidirectional TLS between all microservice pods.',
        project: infraProj._id,
        assignee: security._id,
        creator: manager._id,
        status: 'in_review',
        priority: 'high',
        dueDate: new Date('2026-09-26'),
        estimatedHours: 12,
        actualHours: 10,
        tags: ['Istio', 'mTLS', 'ServiceMesh'],
        checklists: [
          { title: 'Run traffic test with PERMISSIVE mode', completed: true },
          { title: 'Switch internal mesh to STRICT', completed: true },
          { title: 'Audit third-party telemetry exporters', completed: false },
        ],
        comments: [
          {
            user: security._id,
            text: 'Prometheus metrics confirmed 100% of inter-pod TCP handshakes are encrypted with TLS 1.3 cipher suites.',
          },
        ],
      },
      {
        title: 'Configure Prometheus Alertmanager Escalation Policies to PagerDuty',
        taskCode: 'INFRA-104',
        description:
          'Map severity levels (P1-P4) to on-call rotation schedules in PagerDuty with synthetic blackbox probes.',
        project: infraProj._id,
        assignee: sre._id,
        creator: manager._id,
        status: 'todo',
        priority: 'medium',
        dueDate: new Date('2026-10-05'),
        estimatedHours: 8,
        tags: ['Monitoring', 'SRE', 'Alerting'],
        checklists: [
          { title: 'Define route tree rules in alertmanager.yml', completed: false },
          { title: 'Perform test call trigger during business hours', completed: false },
        ],
      },

      // PULSE Project Tasks
      {
        title: 'Establish 8pt Fluid Grid System & Color Tokens in Tailwind Config',
        taskCode: 'PULSE-101',
        description:
          'Configure CSS variables for the 60-30-10 color rule with high-contrast slate dark canvas and vibrant indigo accents.',
        project: pulseProj._id,
        assignee: designer._id,
        creator: manager._id,
        status: 'completed',
        priority: 'high',
        dueDate: new Date('2026-09-05'),
        estimatedHours: 10,
        actualHours: 8,
        tags: ['DesignSystem', 'Tokens', 'CSS'],
        checklists: [
          { title: 'Establish 8px rhythm spacing tokens', completed: true },
          { title: 'Contrast ratios checked for WCAG AAA compliance', completed: true },
          { title: 'Sync Figma variable tokens with Tailwind config', completed: true },
        ],
        comments: [
          {
            user: designer._id,
            text: 'Figma token schema matches 100% with the Tailwind CSS palette.',
          },
        ],
      },
      {
        title: 'Build Drag-and-Drop Interactive Kanban Board Component',
        taskCode: 'PULSE-102',
        description:
          'Create high-performance kanban columns with status badges, quick move buttons, and smooth transition animations.',
        project: pulseProj._id,
        assignee: dev1._id,
        creator: manager._id,
        status: 'in_progress',
        priority: 'urgent',
        dueDate: new Date('2026-09-22'),
        estimatedHours: 24,
        actualHours: 18,
        tags: ['Kanban', 'React', 'UI'],
        checklists: [
          { title: 'Column header with dynamic task counters', completed: true },
          { title: '1-click status change menu', completed: true },
          { title: 'Filter chips sync with column state', completed: false },
        ],
        comments: [
          {
            user: dev1._id,
            text: 'Cards render smoothly at 60fps. Added micro-interaction scale effect on hover.',
          },
          {
            user: designer._id,
            text: 'Looks stunning! The hover shadows give great depth to the cards.',
          },
        ],
      },
      {
        title: 'Design Accessible Form Modals for Project and Task Creation',
        taskCode: 'PULSE-103',
        description:
          'Implement modal overlays with backdrop blur, keyboard ESC dismissal, focus trap, and clean validation states.',
        project: pulseProj._id,
        assignee: designer._id,
        creator: manager._id,
        status: 'in_review',
        priority: 'medium',
        dueDate: new Date('2026-09-25'),
        estimatedHours: 12,
        actualHours: 11,
        tags: ['Accessibility', 'Modals', 'Forms'],
        checklists: [
          { title: 'Trap keyboard focus inside modal', completed: true },
          { title: 'Escape key close listener', completed: true },
          { title: 'Screen reader aria-modal annotations', completed: true },
        ],
      },
      {
        title: 'Implement Interactive Recharts for Team Velocity and Status Trends',
        taskCode: 'PULSE-104',
        description:
          'Build responsive doughnut charts for status breakdown and stacked bar charts for priority distribution with custom tooltips.',
        project: pulseProj._id,
        assignee: dev1._id,
        creator: manager._id,
        status: 'todo',
        priority: 'medium',
        dueDate: new Date('2026-10-02'),
        estimatedHours: 14,
        tags: ['Charts', 'Analytics', 'Visualization'],
        checklists: [
          { title: 'Status breakdown donut chart', completed: false },
          { title: 'Priority distribution bar chart', completed: false },
        ],
      },

      // SEC Project Tasks
      {
        title: 'Conduct Automated Static Analysis & Dependency Vulnerability Audit',
        taskCode: 'SEC-101',
        description:
          'Integrate Trivy and Snyk into GitHub Actions CI workflow with blocking rules on critical CVEs.',
        project: secProj._id,
        assignee: security._id,
        creator: admin._id,
        status: 'completed',
        priority: 'urgent',
        dueDate: new Date('2026-09-12'),
        estimatedHours: 16,
        actualHours: 14,
        tags: ['Trivy', 'CI/CD', 'Security'],
        checklists: [
          { title: 'Configure Trivy vulnerability scanner', completed: true },
          { title: 'Create automated GitHub Security Advisories', completed: true },
        ],
        comments: [
          {
            user: security._id,
            text: 'Zero critical CVEs found in base Alpine containers.',
          },
        ],
      },
      {
        title: 'Enforce Role-Based Access Control (RBAC) Test Suite on All Endpoints',
        taskCode: 'SEC-102',
        description:
          'Verify server middleware correctly denies Member role from project creation, user role elevation, and deletion endpoints.',
        project: secProj._id,
        assignee: security._id,
        creator: admin._id,
        status: 'in_progress',
        priority: 'high',
        dueDate: new Date('2026-09-28'),
        estimatedHours: 14,
        actualHours: 8,
        tags: ['RBAC', 'Auth', 'Testing'],
        checklists: [
          { title: 'Write negative permission tests for member role', completed: true },
          { title: 'Verify manager scope restrictions', completed: false },
          { title: 'Test token expiration handling', completed: false },
        ],
      },
      {
        title: 'Draft SOC2 Evidence Collection Procedures for Access Logs',
        taskCode: 'SEC-103',
        description:
          'Establish immutable S3 bucket retention policy for audit activity logs with KMS CMEK encryption keys.',
        project: secProj._id,
        assignee: security._id,
        creator: admin._id,
        status: 'todo',
        priority: 'medium',
        dueDate: new Date('2026-10-15'),
        estimatedHours: 20,
        tags: ['Compliance', 'SOC2', 'AuditTrail'],
        checklists: [
          { title: 'Configure CloudTrail log streaming', completed: false },
          { title: 'Verify Object Lock retention mode', completed: false },
        ],
      },

      // DATA Project Tasks
      {
        title: 'Benchmark Kafka Consumer Group Throughput Under 100k msg/sec Load',
        taskCode: 'DATA-101',
        description:
          'Simulate telemetry bursts using k6 and measure end-to-end ingestion lag into ClickHouse storage buffers.',
        project: dataProj._id,
        assignee: dev1._id,
        creator: manager._id,
        status: 'todo',
        priority: 'high',
        dueDate: new Date('2026-10-18'),
        estimatedHours: 18,
        tags: ['Kafka', 'LoadTesting', 'ClickHouse'],
        checklists: [
          { title: 'Provision 3-broker Strimzi Kafka cluster', completed: false },
          { title: 'Run continuous 30-minute stress script', completed: false },
        ],
      },
      {
        title: 'Design Customer Sentiment Scoring Schema and Feature Store',
        taskCode: 'DATA-102',
        description:
          'Architect feature vectors for real-time customer satisfaction signals extracted from support interactions.',
        project: dataProj._id,
        assignee: sre._id,
        creator: manager._id,
        status: 'backlog',
        priority: 'low',
        dueDate: new Date('2026-11-01'),
        estimatedHours: 16,
        tags: ['DataModel', 'FeatureStore'],
        checklists: [
          { title: 'Entity-relationship diagram draft', completed: false },
        ],
      },
    ];

    await Task.create(tasks);

    console.log('Seeding recent audit activity logs...');
    await ActivityLog.create([
      {
        user: admin._id,
        action: 'created_project',
        entityType: 'Project',
        entityId: secProj._id,
        entityTitle: secProj.title,
        details: 'Initialized SOC2 Type II compliance roadmap',
      },
      {
        user: manager._id,
        action: 'created_project',
        entityType: 'Project',
        entityId: pulseProj._id,
        entityTitle: pulseProj.title,
        details: 'Kicked off Pulse Design System and unified UI components',
      },
      {
        user: designer._id,
        action: 'completed_task',
        entityType: 'Task',
        entityId: pulseProj._id,
        entityTitle: 'Establish 8pt Fluid Grid System & Color Tokens',
        details: 'Finalized WCAG AAA color variables and 8pt rhythm tokens',
      },
      {
        user: sre._id,
        action: 'completed_task',
        entityType: 'Task',
        entityId: infraProj._id,
        entityTitle: 'Draft Infrastructure as Code for Multi-Region VPC Peering',
        details: 'Approved Terraform modules and committed to main branch',
      },
      {
        user: dev1._id,
        action: 'status_changed',
        entityType: 'Task',
        entityId: pulseProj._id,
        entityTitle: 'Build Drag-and-Drop Interactive Kanban Board Component',
        details: 'Advanced task to In Progress with micro-interactions enabled',
      },
      {
        user: security._id,
        action: 'status_changed',
        entityType: 'Task',
        entityId: infraProj._id,
        entityTitle: 'Implement Istio mTLS Strict Enforce Mode Across Namespaces',
        details: 'Submitted implementation for architecture review',
      },
    ]);

    console.log('Database seeded successfully with authentic enterprise dataset!');
    console.log('\nDemo Credentials Available:');
    console.log('----------------------------------------------------');
    console.log('ADMIN:   email: admin@pulse.io    | password: Password123!');
    console.log('MANAGER: email: manager@pulse.io  | password: Password123!');
    console.log('MEMBER:  email: member@pulse.io   | password: Password123!');
    console.log('----------------------------------------------------\n');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

// If run directly via CLI: `node src/utils/seeder.js`
if (process.argv[1]?.endsWith('seeder.js')) {
  (async () => {
    await connectDB();
    await seedDatabase();
    await closeDB();
    process.exit(0);
  })();
}
