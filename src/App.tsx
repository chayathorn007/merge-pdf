import { CssBaseline, Container } from "@mui/material";
import UploadPdfClient from "./Components/UploadPdfClient";

function App() {
  return (
    <>
      <CssBaseline />
      <Container maxWidth="md">
        <UploadPdfClient />
      </Container>
    </>
  );
}

export default App;
