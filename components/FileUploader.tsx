import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { FileUp, Image, FileText, File } from 'lucide-react-native';
import colors from '@/constants/colors';
import Button from './Button';
import { useThemeStore } from '@/hooks/useThemeStore';

interface FileUploaderProps {
  onFileSelected: (uri: string, name: string, type: string) => void;
}

export default function FileUploader({ onFileSelected }: FileUploaderProps) {
  const { isDarkMode } = useThemeStore();
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const themeColors = isDarkMode ? {
    background: colors.darkBackground,
    text: colors.darkText,
    textLight: colors.darkTextLight,
    card: colors.darkSecondary,
    border: colors.darkBorder,
    primary: colors.darkPrimary,
  } : {
    background: colors.background,
    text: colors.text,
    textLight: colors.textLight,
    card: 'white',
    border: colors.border,
    primary: colors.primary,
  };

  const pickImage = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uri = asset.uri;
        const name = uri.split('/').pop() || 'image';
        setFileName(name);
        setFileType('image');
        onFileSelected(uri, name, 'image');
      }
      
      setShowOptions(false);
    } catch (error) {
      console.error('Error picking image:', error);
      setError('Image upload failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const pickDocument = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
        copyToCacheDirectory: true,
      });

      if (result.canceled === false && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uri = asset.uri;
        const name = asset.name || uri.split('/').pop() || 'document';
        const mimeType = asset.mimeType || 'application/octet-stream';
        
        let type = 'document';
        if (mimeType.includes('pdf')) {
          type = 'pdf';
        } else if (mimeType.includes('msword')) {
          type = 'doc';
        } else if (mimeType.includes('openxmlformats-officedocument.wordprocessingml.document')) {
          type = 'docx';
        } else if (mimeType.includes('text')) {
          type = 'text';
        } else {
          // If it's not a supported file type, show an error
          setError('Only PDF, DOC, DOCX, and TXT files are supported. For other document types, please paste the text directly or take screenshots.');
          setIsLoading(false);
          return;
        }
        
        setFileName(name);
        setFileType(type);
        onFileSelected(uri, name, type);
      }
      
      setShowOptions(false);
    } catch (error) {
      console.error('Error picking document:', error);
      setError('Document upload failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFile = () => {
    if (Platform.OS === 'web') {
      // For web, trigger the hidden file input
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    } else {
      setShowOptions(true);
    }
  };

  const renderFileTypeIcon = () => {
    if (!fileType) return null;
    
    switch (fileType) {
      case 'image':
        return <Image size={20} color={themeColors.primary} />;
      case 'pdf':
        return <FileText size={20} color={themeColors.primary} />;
      case 'docx':
      case 'doc':
      case 'text':
      default:
        return <File size={20} color={themeColors.primary} />;
    }
  };

  // For web, we need to handle file uploads differently
  const handleWebFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const fileUrl = URL.createObjectURL(file);
    const fileName = file.name;
    
    let fileType = 'document';
    if (file.type.includes('image')) {
      fileType = 'image';
    } else if (file.type.includes('pdf')) {
      fileType = 'pdf';
    } else if (file.type.includes('msword')) {
      fileType = 'doc';
    } else if (file.type.includes('openxmlformats-officedocument.wordprocessingml.document')) {
      fileType = 'docx';
    } else if (file.type.includes('text')) {
      fileType = 'text';
    } else {
      // If it's not a supported file type, show an error
      setError('Only images (JPG, PNG), PDFs, Word documents (DOC, DOCX), and text (TXT) files are supported.');
      return;
    }
    
    setFileName(fileName);
    setFileType(fileType);
    onFileSelected(fileUrl, fileName, fileType);
    setShowOptions(false);
  };

  return (
    <View style={styles.container}>
      <View style={[
        styles.uploadArea, 
        { 
          borderColor: themeColors.border,
          backgroundColor: themeColors.card 
        }
      ]}>
        <FileUp size={48} color={themeColors.primary} style={styles.icon} />
        <Text style={[styles.title, { color: themeColors.text }]}>Upload your document</Text>
        <Text style={[styles.subtitle, { color: themeColors.textLight }]}>
          Supported formats: JPG, PNG, PDF, DOC, DOCX, TXT
        </Text>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={themeColors.primary} />
            <Text style={[styles.loadingText, { color: themeColors.textLight }]}>Uploading file...</Text>
          </View>
        ) : fileName ? (
          <View style={[
            styles.fileInfo, 
            { 
              backgroundColor: themeColors.background,
              borderColor: themeColors.border 
            }
          ]}>
            <View style={styles.fileDetails}>
              {renderFileTypeIcon()}
              <Text style={[styles.fileName, { color: themeColors.text }]} numberOfLines={1}>{fileName}</Text>
            </View>
            <Button 
              title="Change File" 
              onPress={handleSelectFile} 
              variant="outline"
              size="small"
              style={styles.changeButton}
            />
          </View>
        ) : Platform.OS === 'web' ? (
          // Web-specific file input
          <View style={styles.webUploadContainer}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
              onChange={handleWebFileUpload}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer',
                zIndex: 10,
              }}
            />
            <Button 
              title="Select File" 
              onPress={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
              style={styles.button}
            />
          </View>
        ) : (
          <Button 
            title="Select File" 
            onPress={handleSelectFile} 
            style={styles.button}
          />
        )}
        
        {showOptions && Platform.OS !== 'web' && (
          <View style={[
            styles.optionsContainer, 
            { backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)' }
          ]}>
            <TouchableOpacity 
              style={[
                styles.option, 
                { 
                  backgroundColor: themeColors.background,
                  borderColor: themeColors.border 
                }
              ]} 
              onPress={pickImage}
            >
              <Image size={24} color={themeColors.primary} style={styles.optionIcon} />
              <Text style={[styles.optionText, { color: themeColors.text }]}>Image (JPG, PNG)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.option, 
                { 
                  backgroundColor: themeColors.background,
                  borderColor: themeColors.border 
                }
              ]} 
              onPress={pickDocument}
            >
              <FileText size={24} color={themeColors.primary} style={styles.optionIcon} />
              <Text style={[styles.optionText, { color: themeColors.text }]}>Document (PDF, DOC, DOCX, TXT)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.option, 
                styles.cancelOption, 
                { 
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border 
                }
              ]} 
              onPress={() => setShowOptions(false)}
            >
              <Text style={[styles.cancelText, { color: themeColors.textLight }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>
      <Text style={[styles.disclaimer, { color: themeColors.textLight }]}>
        Your document will be processed securely and not stored unless you save it.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    minWidth: 200,
  },
  webUploadContainer: {
    position: 'relative',
    width: 200,
    height: 44,
  },
  fileInfo: {
    borderRadius: 8,
    padding: 12,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  fileDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  fileName: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  changeButton: {
    marginLeft: 8,
  },
  disclaimer: {
    fontSize: 12,
    marginTop: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorText: {
    color: colors.error,
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  optionsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    zIndex: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  cancelOption: {
    justifyContent: 'center',
    marginTop: 8,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});