'use client'
import { motion } from 'framer-motion'
import * as React from 'react'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/atoms/avatar'
import { Badge } from '@/components/ui/atoms/badge'
import { Heading } from '@/components/ui/atoms/Heading'

//Types

type TaskCardProps = {
  title: string
  description?: string
  tags?: string[]
  assignees?: {
    src?: string
    fallback: string
  }[]
}

export function TaskCard({
  title,
  description,
  tags,
  assignees,
}: TaskCardProps) {
  return (
    <motion.div
      layout
      className="bg-card text-card-foreground flex flex-col gap-2 rounded-lg border p-4 shadow-md"
    >
      {/* Title & Description */}
      <Heading size="h3">{title}</Heading>
      {description && (
        <p className="text-muted-foreground text-sm">{description}</p>
      )}

      {/* Tags */}

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}
      {/* Assignees */}
      {assignees && assignees.length > 0 && (
        <div className="mt-2 flex space-x-2">
          {assignees.map((assignee, index) => (
            <Avatar key={index} className="border-card border-2">
              <AvatarImage src={assignee.src} />
              <AvatarFallback>{assignee.fallback}</AvatarFallback>
            </Avatar>
          ))}
        </div>
      )}
    </motion.div>
  )
}
