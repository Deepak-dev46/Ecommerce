import { Grid, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getItemsBySubcategory } from "../../../api/serviceCatalogApi";

export default function ItemPage() {
  const { subcategoryId } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    getItemsBySubcategory(subcategoryId).then(r => setItems(r.data));
  }, [subcategoryId]);

  return (
    <Grid container spacing={2}>
      {items.map(item => (
        <Grid item xs={12} sm={6} md={4} key={item.id}>
          <Paper
            sx={{ p: 2 }}
            onClick={() =>
              navigate(`/service-catalog/create/${item.id}`)
            }
          >
            <Typography fontWeight={600}>{item.name}</Typography>
            <Typography variant="body2">{item.description}</Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}