import React from "react";
import { Typography, List, ListItem, ListItemText, Stack } from "@mui/material";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  website: string;
  projectDescription: string;
  cardName: string;
  cardNumber: string;
  expDate: string;
  cvv: string;
}

interface ReviewProps {
  formData: FormData;
}

const Review: React.FC<ReviewProps> = ({ formData }) => {
  const payments = [
    { name: "Card holder", detail: formData.cardName },
    {
      name: "Card number",
      detail: `xxxx-xxxx-xxxx-${formData.cardNumber.slice(-4)}`,
    },
    { name: "Expiry date", detail: formData.expDate },
  ];

  return (
    <Stack spacing={3}>
      <Typography variant="h6">Order summary</Typography>
      <List disablePadding>
        <ListItem sx={{ py: 1, px: 0 }}>
          <ListItemText primary="Project Details" />
        </ListItem>
        <ListItem sx={{ py: 1, px: 4 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={4}
            width="100%"
          >
            <Stack spacing={1} flex={1}>
              <Typography>Name</Typography>
              <Typography>Email</Typography>
              <Typography>Company</Typography>
              <Typography>Website</Typography>
              <Typography>Project Description</Typography>
            </Stack>
            <Stack spacing={1} flex={1}>
              <Typography>{`${formData.firstName} ${formData.lastName}`}</Typography>
              <Typography>{formData.email}</Typography>
              <Typography>{formData.company}</Typography>
              <Typography>{formData.website}</Typography>
              <Typography style={{ wordBreak: "break-word" }}>
                {formData.projectDescription}
              </Typography>
            </Stack>
          </Stack>
        </ListItem>
      </List>
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ mt: 2 }}>
          Payment details
        </Typography>
        <Stack spacing={1}>
          {payments.map((payment) => (
            <Stack
              key={payment.name}
              direction="row"
              justifyContent="space-between"
              spacing={2}
            >
              <Typography>{payment.name}</Typography>
              <Typography>{payment.detail}</Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Review;
