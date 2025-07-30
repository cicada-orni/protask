import { z } from 'zod'

export const WorkspaceSchema = z.object({
  workspaceName: z
    .string()
    .min(3, { message: 'Workspace name must be atleast 3 characters' }),
})

export const InvitesSchema = z.object({
  teammateEmails: z.array(z.email({ message: 'Invalid email address' })),
})

export type WorkspaceData = z.infer<typeof WorkspaceSchema>
export type InvitesData = z.infer<typeof InvitesSchema>
