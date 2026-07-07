import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'
import { isRegistrationStaff } from '../../access/roles'
import { canManageUsers, canReadUsers, canUpdateRoleField } from '../../access/users'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: canManageUsers,
    delete: canManageUsers,
    read: canReadUsers,
    update: canManageUsers,
  },
  admin: {
    defaultColumns: ['name', 'email', 'role'],
    useAsTitle: 'name',
    hidden: ({ user }) => isRegistrationStaff(user),
    components: {
      views: {
        list: {
          Component: '@/components/admin/lists/UsersListView',
        },
      },
    },
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      // Nullable column (NOT `required`): a NOT NULL alter would fail on existing
      // rows and break dev auto-push — same rationale as the alumni/tshirt fields.
      // Existing production rows are backfilled to 'admin' (see Post-implementation).
      defaultValue: 'admin',
      saveToJWT: true,
      options: [
        { label: 'Administrator', value: 'admin' },
        { label: 'Petugas Pendaftaran', value: 'registration-staff' },
      ],
      access: {
        update: canUpdateRoleField,
      },
    },
  ],
  timestamps: true,
}
