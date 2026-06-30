import { Grid, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getItemsBySubcategory } from "../../../api/serviceCatalogApi";

export default function ItemPage() {
  const { subcategoryId } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    // activeOnly=true: backend already filters inactive items for end users.
    // FIX: Removed redundant client-side .filter(item => item.active !== false)
    // since the backend handles this via the activeOnly=true param.
    getItemsBySubcategory(subcategoryId, true).then(r => {
      setItems(Array.isArray(r.data) ? r.data : []);
    });
  }, [subcategoryId]);

  return (
    <Grid container spacing={2}>
      {items.map(item => (
        <Grid item xs={12} sm={6} md={4} key={item.id}>
          <Paper
            sx={{ p: 2, cursor: 'pointer', '&:hover': { boxShadow: 3 } }}
            onClick={() => navigate(`/service-catalog/create/${item.id}`)}
          >
            <Typography fontWeight={600}>{item.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {item.description}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
