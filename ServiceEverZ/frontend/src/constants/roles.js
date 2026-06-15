// src/constants/roles.js
export const SYSTEM_ROLES = [
  {
    name: 'ADMIN',
    label: 'Administrator',
    description: 'Full system access. Manages users, roles, and policies.',
    color: '#27235C',
    gradient: 'linear-gradient(135deg, #27235C 0%, #3D378A 100%)',
    icon: 'AdminPanelSettings',
    assignable: false,
  },
  {
    name: 'RMO',
    label: 'Resource Management Officer',
    description: 'Manages projects, assigns special roles and resource owners.',
    color: '#97247E',
    gradient: 'linear-gradient(135deg, #97247E 0%, #AC5098 100%)',
    icon: 'ManageAccounts',
    assignable: true,
  },
  {
    name: 'ITSM_MANAGER',
    label: 'ITSM Manager',
    description: 'Manages IT service management workflows and escalations.',
    color: '#AC5098',
    gradient: 'linear-gradient(135deg, #AC5098 0%, #C96DB0 100%)',
    icon: 'SupportAgent',
    assignable: true,
  },
  {
    name: 'END_USER',
    label: 'End User',
    description: 'Standard platform user with access to assigned projects.',
    color: '#24A148',
    gradient: 'linear-gradient(135deg, #24A148 0%, #2DC25A 100%)',
    icon: 'Person',
    assignable: true,
  },
  {
    name: 'SUPPORT_PERSONNEL',
    label: 'Support Personnel',
    description: 'Handles support tickets and service requests.',
    color: '#E2B93B',
    gradient: 'linear-gradient(135deg, #E2B93B 0%, #F0C84A 100%)',
    icon: 'HeadsetMic',
    assignable: true,
  },
  {
    name: 'APPROVAL_MANAGER_L1',
    label: 'Approval Manager L1',
    description: 'First-level approval authority for resource requests.',
    color: '#E01950',
    gradient: 'linear-gradient(135deg, #E01950 0%, #F03060 100%)',
    icon: 'VerifiedUser',
    assignable: false, // assigned by RMO only
  },
  {
    name: 'APPROVAL_MANAGER_L2',
    label: 'Approval Manager L2',
    description: 'Second-level approval authority for escalated requests.',
    color: '#6B5CE7',
    gradient: 'linear-gradient(135deg, #6B5CE7 0%, #8B7CF7 100%)',
    icon: 'VerifiedUser',
    assignable: false,
  },
  {
    name: 'RESOURCE_OWNER',
    label: 'Resource Owner',
    description: 'Owns and manages specific project resources.',
    color: '#0EA5E9',
    gradient: 'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)',
    icon: 'Inventory2',
    assignable: false,
  },
];
 
// Admin can only assign these roles
export const ADMIN_ASSIGNABLE_ROLES = SYSTEM_ROLES.filter((r) => r.assignable);