import Link from "next/link";
import { styled } from "@mui/material";
import Image from "next/image";

const LinkStyled = styled(Link)(() => ({
  height: "100px",
  width: "200px",
  overflow: "hidden",
  display: "block",
  marginBottom: 10
}));

const Logo = () => {
  return (
    <LinkStyled href="/">
      <Image src="/images/logos/back.png" alt="logo" height={100} width={200} priority />
    </LinkStyled>
  );
};

export default Logo;
  