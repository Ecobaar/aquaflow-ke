
import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material'
import { Edit, Delete } from '@mui/icons-material'
import { InventoryItem } from './types'

interface InventoryTableProps {
  items: InventoryItem[]
  onEdit: (item: InventoryItem) => void
  onDelete: (id: string) => void
}

const InventoryTable: React.FC<InventoryTableProps> = ({ items, onEdit, onDelete }) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Item Name</TableCell>
            <TableCell align="right">Quantity</TableCell>
            <TableCell>Unit</TableCell>
            <TableCell>Date</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.item_name}</TableCell>
              <TableCell align="right">{item.quantity}</TableCell>
              <TableCell>{item.unit}</TableCell>
              <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
              <TableCell align="center">
                <IconButton onClick={() => onEdit(item)} size="small">
                  <Edit />
                </IconButton>
                <IconButton onClick={() => onDelete(item.id)} size="small" color="error">
                  <Delete />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No inventory items found. Add some items to get started.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default InventoryTable
