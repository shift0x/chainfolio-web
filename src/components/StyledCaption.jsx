import { styled, Typography } from "@mui/material";

const StyledTypography = styled(Typography)({
    pb: "3px",
    color: "#666"
})

export const StyledCaption = ({ variant = 'caption', display = 'block', ...props }) => (
    <StyledTypography variant={variant} display={display} {...props} />
  );

