import Link from "next/link";
import { styled } from "@mui/material";
import Image from "next/image";

const LinkStyled = styled(Link)(() => ({
  height: "80px",
  width: "180px",
  overflow: "hidden",
  display: "block",
  marginBottom: 10
}));

const Logo = () => {
  return (
    <LinkStyled href="/">
      <Image src="/images/logos/dark-logo.png" alt="logo" height={80} width={174} priority />
    </LinkStyled>
  );
};

export default Logo;
  