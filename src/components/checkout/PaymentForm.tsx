import React from "react";
import { Typography, Stack, TextField } from "@mui/material";

interface FormData {
  cardName: string;
  cardNumber: string;
  expDate: string;
  cvv: string;
}

interface PaymentFormProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ formData, setFormData }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h6">Payment method</Typography>
      <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
        <TextField
          required
          id="cardName"
          name="cardName"
          label="Name on card"
          fullWidth
          autoComplete="cc-name"
          variant="outlined"
          value={formData.cardName}
          onChange={handleChange}
        />
        <TextField
          required
          id="cardNumber"
          name="cardNumber"
          label="Card number"
          fullWidth
          autoComplete="cc-number"
          variant="outlined"
          value={formData.cardNumber}
          onChange={handleChange}
        />
      </Stack>
      <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
        <TextField
          required
          id="expDate"
          name="expDate"
          label="Expiry date"
          fullWidth
          autoComplete="cc-exp"
          variant="outlined"
          value={formData.expDate}
          onChange={handleChange}
        />
        <TextField
          required
          id="cvv"
          name="cvv"
          label="CVV"
          helperText="Last three digits on signature strip"
          fullWidth
          autoComplete="cc-csc"
          variant="outlined"
          value={formData.cvv}
          onChange={handleChange}
        />
      </Stack>
    </Stack>
  );
};

export default PaymentForm;
