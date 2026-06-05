import React from 'react';
import {
  Box, Typography, Divider, Button, Chip, Grid,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { AssetStatusChip } from '../common/AssetStatusChip';

function Row({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <Box sx={{ display: 'flex', py: 0.6 }}>
      <Typography sx={{ width: 180, flexShrink: 0, fontSize: '0.78rem', color: '#888', fontWeight: 500 }}>{label}</Typography>
      <Typography sx={{ fontSize: '0.82rem', color: '#1c1a3a', fontWeight: 500, wordBreak: 'break-word' }}>{String(value)}</Typography>
    </Box>
  );
}

function Section({ title, children }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#97247E', textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

export default function AssetDetailPanel({ asset, onEdit, onDelete }) {
  if (!asset) return null;
  const isRental = asset.ownershipType === 'RENTAL';
  const isOwned  = asset.ownershipType === 'OWNED';

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography sx={{ fontSize: '0.7rem', color: '#97247E', fontWeight: 700, letterSpacing: '0.08em', mb: 0.3 }}>
            {asset.assetTag}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1c1a3a', mb: 0.5 }}>
            {asset.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <AssetStatusChip status={asset.status} />
            <Chip
              label={asset.category?.replace(/_/g, ' ')}
              size="small"
              sx={{ fontSize: '0.68rem', fontWeight: 600, backgroundColor: '#EEEDF8', color: '#27235C' }}
            />
            <Chip
              label={asset.ownershipType}
              size="small"
              sx={{ fontSize: '0.68rem', fontWeight: 600, backgroundColor: '#F9EEFA', color: '#97247E' }}
            />
            {asset.rentalExpiringSoon && (
              <Chip label="⚠ Expiring Soon" size="small" sx={{ fontSize: '0.68rem', fontWeight: 700, backgroundColor: '#FDF8EC', color: '#E2B93B' }} />
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" startIcon={<EditIcon />} variant="outlined" onClick={onEdit}
            sx={{ borderColor: '#27235C', color: '#27235C', '&:hover': { backgroundColor: '#f0f0f8' } }}>
            Edit
          </Button>
          <Button size="small" startIcon={<DeleteIcon />} variant="outlined" color="error" onClick={onDelete}>
            Delete
          </Button>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Section title="Basic Info">
        <Row label="Brand" value={asset.brand} />
        <Row label="Model" value={asset.model} />
        <Row label="Serial Number" value={asset.serialNumber} />
        <Row label="Location" value={asset.location} />
        <Row label="Assigned To User ID" value={asset.assignedToUserId} />
        <Row label="Added By SP ID" value={asset.addedBySpId} />
        <Row label="Notes" value={asset.notes} />
        <Row label="Created At" value={asset.createdAt ? new Date(asset.createdAt).toLocaleString() : null} />
        <Row label="Updated At" value={asset.updatedAt ? new Date(asset.updatedAt).toLocaleString() : null} />
      </Section>

      {isOwned && (
        <Section title="Ownership Details">
          <Row label="Purchase Date" value={asset.purchaseDate} />
          <Row label="Purchase Cost" value={asset.purchaseCost != null ? `$${asset.purchaseCost.toLocaleString()}` : null} />
          <Row label="Warranty Expiry" value={asset.warrantyExpiryDate} />
          <Row label="Depreciation Rate" value={asset.depreciationRatePercent != null ? `${asset.depreciationRatePercent}%` : null} />
        </Section>
      )}

      {isRental && (
        <Section title="Rental Details">
          <Row label="Vendor Name" value={asset.rentalVendorName} />
          <Row label="Vendor Contact" value={asset.rentalVendorContact} />
          <Row label="Contract Number" value={asset.rentalContractNumber} />
          <Row label="Rental Period" value={asset.rentalStartDate && asset.rentalEndDate ? `${asset.rentalStartDate} → ${asset.rentalEndDate}` : null} />
          <Row label="Cost/Month" value={asset.rentalCostPerMonth != null ? `$${asset.rentalCostPerMonth.toLocaleString()}` : null} />
          <Row label="Deposit Amount" value={asset.rentalDepositAmount != null ? `$${asset.rentalDepositAmount.toLocaleString()}` : null} />
          <Row label="Renewal Option" value={asset.rentalRenewalOption != null ? (asset.rentalRenewalOption ? 'Yes' : 'No') : null} />
          <Row label="Return Condition" value={asset.rentalReturnCondition} />
          <Row label="Returned Date" value={asset.rentalReturnedDate} />
        </Section>
      )}
    </Box>
  );
}
