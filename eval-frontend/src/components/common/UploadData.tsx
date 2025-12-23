import React, { useState } from 'react';
import { uploadWorkbooks } from '../../utils/api';
import {
  Container,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  LinearProgress,
  Snackbar,
  Alert
} from '@mui/material';

const UploadData: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputFiles = e.target.files;
    if (!inputFiles) return;

    // Only keep Excel workbook files
    const selected = Array.from(inputFiles).filter(file =>
      /\.xlsx$/i.test(file.name)
    );    
    setFiles(selected);

    if (selected.length < inputFiles.length) {
      setErrorMsg('Only Excel workbook files (.xls, .xlsx) are allowed.');
    } else {
      setErrorMsg('');
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await uploadWorkbooks(files);
      setSuccessMsg('Workbook uploaded successfully!');
      setFiles([]);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 14 }}>
      <Typography variant="h4" gutterBottom>
        Upload Excel Workbook
      </Typography>

      <Box sx={{ my: 2, mt: 10 }}>
        <input
          accept=".xls,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          id="file-upload"
          multiple
          type="file"
          hidden
          onChange={handleFileChange}
        />
        <label htmlFor="file-upload">
          <Button variant="contained" component="span">
            Choose Workbook
          </Button>
        </label>
      </Box>

      {files.length > 0 && (
        <List>
          {files.map((file, idx) => (
            <ListItem key={idx}>{file.name}</ListItem>
          ))}
        </List>
      )}

      <Box sx={{ my: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={uploading || files.length === 0}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </Box>

      {uploading && <LinearProgress />}

      <Snackbar
        open={!!successMsg}
        autoHideDuration={6000}
        onClose={() => setSuccessMsg('')}
      >
        <Alert
          onClose={() => setSuccessMsg('')}
          severity="success"
          sx={{ width: '100%' }}
        >
          {successMsg}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!errorMsg}
        autoHideDuration={6000}
        onClose={() => setErrorMsg('')}
      >
        <Alert
          onClose={() => setErrorMsg('')}
          severity="error"
          sx={{ width: '100%' }}
        >
          {errorMsg}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UploadData;
