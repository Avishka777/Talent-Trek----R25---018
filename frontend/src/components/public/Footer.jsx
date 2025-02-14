import { Footer } from "flowbite-react";
import logo from "../../assets/public/logo.png";

export default function FooterComponent() {
  return (
    <Footer container>
      <div className="w-full text-center">
        <div className="w-full justify-between sm:flex sm:items-center sm:justify-between">
          <Footer.Brand
            href="#"
            src={logo}
            name="TALENT TREK"
            alt="TALENT TREK LOGO"
          />
          <Footer.LinkGroup>
            <Footer.Link href="#">About</Footer.Link>
            <Footer.Link href="#">Privacy Policy</Footer.Link>
            <Footer.Link href="#">Licensing</Footer.Link>
            <Footer.Link href="#">Contact</Footer.Link>
          </Footer.LinkGroup>
        </div>
        <Footer.Divider />
        <Footer.Copyright href="#" by="TALENT TREK CORPORATION" year={2025} />
      </div>
    </Footer>
  );
}
