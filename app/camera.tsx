import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { RotateCw, X, Camera as CameraIcon, Check } from 'lucide-react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { extractTextFromImage } from '@/utils/ocrService';
import { generateDocumentTitle } from '@/utils/documentUtils';
import { useDocumentStore } from '@/hooks/useDocumentStore';
import { useThemeStore } from '@/hooks/useThemeStore';
import { getRateLimitStatus } from '@/utils/aiService';
import colors from '@/constants/colors';
import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import RateLimitInfo from '@/components/RateLimitInfo';

export default function CameraScreen() {
  const { isDarkMode } = useThemeStore();
  const [facing, setFacing] = useState<CameraType>('back');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [rateLimitStatus, setRateLimitStatus] = useState({
    scansToday: 0,
    maxScansPerDay: 5,
    scansThisMinute: 0,
    maxScansPerMinute: 1,
  });
  const cameraRef = useRef<any>(null);
  const { addToHistory } = useDocumentStore();

  // Load rate limit status
  useEffect(() => {
    const loadRateLimitStatus = async () => {
      try {
        const status = await getRateLimitStatus();
        setRateLimitStatus(status);
      } catch (error) {
        if (__DEV__) console.error('Error loading rate limit status:', error);
      }
    };
    
    loadRateLimitStatus();
    
    // Refresh rate limit status every 30 seconds
    const interval = setInterval(loadRateLimitStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const takePicture = async () => {
    // Check if user has reached daily scan limit
    if (rateLimitStatus.scansToday >= rateLimitStatus.maxScansPerDay) {
      setError("You've used your 5 free scans today.");
      return;
    }

    // Check if user has reached minute scan limit
    if (rateLimitStatus.scansThisMinute >= rateLimitStatus.maxScansPerMinute) {
      setError("Try again in a moment.");
      return;
    }

    if (!cameraRef.current) {
      if (__DEV__) console.error('Camera ref is null');
      setError('Camera not available. Please try again.');
      return;
    }
    
    setIsCapturing(true);
    setError(null);
    
    try {
      if (__DEV__) console.log('Taking picture...');
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        base64: false, // We don't need base64 for the preview
      });
      
      if (__DEV__) console.log('Picture taken:', photo?.uri);
      
      if (photo && photo.uri) {
        setCapturedImage(photo.uri);
        setIsCapturing(false);
      } else {
        throw new Error('Failed to capture image');
      }
    } catch (error) {
      if (__DEV__) console.error('Error taking picture:', error);
      setError('Failed to capture image. Please try again.');
      setIsCapturing(false);
    }
  };

  const processImage = async (uri: string) => {
    // Double-check rate limits before processing
    const currentStatus = await getRateLimitStatus();
    if (currentStatus.scansToday >= currentStatus.maxScansPerDay) {
      setError("You've used your 5 free scans today.");
      return;
    }

    if (currentStatus.scansThisMinute >= currentStatus.maxScansPerMinute) {
      setError("Try again in a moment.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    
    try {
      // Extract text and simplify in one step
      setProcessingStep('Extracting and analyzing text...');
      if (__DEV__) console.log('Starting OCR extraction and simplification for image:', uri);
      
      const result = await extractTextFromImage(uri);
      
      if (__DEV__) console.log('Extracted text:', result.originalText?.substring(0, 100) + '...');
      if (__DEV__) console.log('Simplified text:', result.simplifiedText?.substring(0, 100) + '...');
      
      // Generate a title
      setProcessingStep('Generating document title...');
      if (__DEV__) console.log('Generating document title...');
      
      let title;
      try {
        title = await generateDocumentTitle(result.originalText);
        if (__DEV__) console.log('Generated title:', title);
      } catch (titleError) {
        if (__DEV__) console.error('Title generation error:', titleError);
        title = "Scanned Document";
      }
      
      // Create a new document
      const newDocument = {
        id: Date.now(),
        title,
        date: new Date().toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}),
        text: result.originalText,
        simplified: result.simplifiedText
      };
      
      // Add to store
      if (__DEV__) console.log('Adding document to history:', newDocument.id);
      addToHistory(newDocument);
      
      // Update rate limit status
      const updatedStatus = await getRateLimitStatus();
      setRateLimitStatus(updatedStatus);
      
      // Navigate to results
      if (__DEV__) console.log('Navigating to results page');
      router.push(`/results/${newDocument.id}`);
    } catch (error) {
      if (__DEV__) console.error('Error processing image:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Document scanning failed. Please try again.');
      }
      setIsProcessing(false);
      setProcessingStep(null);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setError(null);
  };

  const simulateCapture = () => {
    // Check if user has reached daily scan limit
    if (rateLimitStatus.scansToday >= rateLimitStatus.maxScansPerDay) {
      Alert.alert(
        "Daily Limit Reached",
        "You've used your 5 free scans today."
      );
      return;
    }

    // Check if user has reached minute scan limit
    if (rateLimitStatus.scansThisMinute >= rateLimitStatus.maxScansPerMinute) {
      Alert.alert(
        "Rate Limit",
        "Try again in a moment."
      );
      return;
    }

    Alert.alert(
      "Camera Simulation",
      "In a real device, this would capture an image. For this demo, we'll simulate scanning a legal document.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Simulate Scan",
          onPress: () => {
            // Create a mock image URI for the simulation
            const mockImageUri = 'https://example.com/mock-legal-document.jpg';
            setCapturedImage(mockImageUri);
          }
        }
      ]
    );
  };

  const canTakePhoto = rateLimitStatus.scansToday < rateLimitStatus.maxScansPerDay && 
                     rateLimitStatus.scansThisMinute < rateLimitStatus.maxScansPerMinute;

  if (!permission) {
    // Camera permissions are still loading
    return (
      <View style={[styles.container, { backgroundColor: '#000' }]}>
        <Stack.Screen options={{ title: "Scan Document" }} />
        <View style={styles.permissionContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.permissionText}>Requesting camera permission...</Text>
        </View>
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={[styles.container, { backgroundColor: '#000' }]}>
        <Stack.Screen options={{ title: "Scan Document" }} />
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>We need your permission to show the camera</Text>
          <Button 
            title="Grant Permission" 
            onPress={requestPermission} 
            style={styles.permissionButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      <Stack.Screen 
        options={{ 
          title: "Scan Document",
          headerRight: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
              <X size={24} color={isDarkMode ? colors.darkPrimary : colors.primary} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.rateLimitContainer}>
        <RateLimitInfo 
          scansToday={rateLimitStatus.scansToday} 
          maxScansPerDay={rateLimitStatus.maxScansPerDay}
          scansThisMinute={rateLimitStatus.scansThisMinute}
          maxScansPerMinute={rateLimitStatus.maxScansPerMinute}
        />
      </View>
      
      {Platform.OS !== 'web' ? (
        capturedImage ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: capturedImage }} style={styles.previewImage} />
            
            <View style={styles.previewOverlay}>
              <Text style={styles.previewTitle}>Review Image</Text>
              <Text style={styles.previewInstructions}>
                Make sure the text is clear and readable
              </Text>
            </View>
            
            <View style={styles.previewControls}>
              <Button 
                title="Retake" 
                variant="outline"
                onPress={retakePhoto}
                style={styles.previewButton}
                disabled={isProcessing}
                icon={<RotateCw size={18} color={isDarkMode ? colors.darkPrimary : colors.primary} />}
              />
              <Button 
                title={isProcessing ? "Processing..." : "Process"} 
                onPress={() => processImage(capturedImage)}
                style={styles.previewButton}
                loading={isProcessing}
                disabled={isProcessing || !canTakePhoto}
                icon={!isProcessing ? <Check size={18} color="white" /> : undefined}
              />
            </View>
            
            {processingStep && (
              <View style={styles.processingOverlay}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.processingText}>{processingStep}</Text>
              </View>
            )}
            
            {error && (
              <View style={styles.errorContainer}>
                <ErrorMessage message={error} />
              </View>
            )}
          </View>
        ) : (
          <CameraView 
            style={styles.camera}
            facing={facing}
            ref={cameraRef}
          >
            <View style={styles.overlay}>
              <View style={styles.documentFrame} />
            </View>
            
            <View style={styles.controls}>
              <TouchableOpacity 
                style={styles.flipButton} 
                onPress={toggleCameraFacing}
                disabled={isCapturing || isProcessing}
              >
                <RotateCw size={24} color="white" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.captureButton,
                  (!canTakePhoto || isCapturing || isProcessing) && styles.disabledButton
                ]} 
                onPress={takePicture}
                disabled={!canTakePhoto || isCapturing || isProcessing}
              >
                <View style={styles.captureButtonInner}>
                  {isCapturing && <View style={styles.capturingIndicator} />}
                  {isProcessing && <ActivityIndicator size="small" color={colors.primary} />}
                </View>
              </TouchableOpacity>
              
              <View style={styles.placeholderButton} />
            </View>
            
            <View style={styles.instructions}>
              <Text style={styles.instructionsText}>
                Position your document within the frame and take a picture
              </Text>
            </View>
          </CameraView>
        )
      ) : (
        // Web fallback with improved simulation
        <View style={styles.cameraPlaceholder}>
          <View style={styles.overlay}>
            <View style={styles.documentFrame} />
          </View>
          
          <CameraIcon size={48} color="#666" style={styles.cameraPlaceholderIcon} />
          <Text style={styles.cameraPlaceholderText}>
            Camera preview would appear here
          </Text>
          
          <View style={styles.controls}>
            <TouchableOpacity 
              style={styles.flipButton} 
              onPress={toggleCameraFacing}
            >
              <RotateCw size={24} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.captureButton,
                (!canTakePhoto || isCapturing || isProcessing) && styles.disabledButton
              ]} 
              onPress={simulateCapture}
              disabled={!canTakePhoto || isCapturing || isProcessing}
            >
              <View style={styles.captureButtonInner}>
                {isCapturing && <View style={styles.capturingIndicator} />}
                {isProcessing && <ActivityIndicator size="small" color={colors.primary} />}
              </View>
            </TouchableOpacity>
            
            <View style={styles.placeholderButton} />
          </View>
          
          <View style={styles.instructions}>
            <Text style={styles.instructionsText}>
              Position your document within the frame and take a picture
            </Text>
          </View>
          
          {processingStep && (
            <View style={styles.processingOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.processingText}>{processingStep}</Text>
            </View>
          )}
          
          {capturedImage && (
            <View style={styles.webSimulationOverlay}>
              <Text style={styles.simulationTitle}>Document Captured!</Text>
              <Text style={styles.simulationText}>Processing legal document...</Text>
              <View style={styles.previewControls}>
                <Button 
                  title="Retake" 
                  variant="outline"
                  onPress={retakePhoto}
                  style={styles.previewButton}
                  disabled={isProcessing}
                />
                <Button 
                  title={isProcessing ? "Processing..." : "Process"} 
                  onPress={() => processImage(capturedImage)}
                  style={styles.previewButton}
                  loading={isProcessing}
                  disabled={isProcessing || !canTakePhoto}
                />
              </View>
            </View>
          )}
        </View>
      )}
      
      {error && !capturedImage && (
        <View style={styles.errorContainer}>
          <ErrorMessage message={error} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222',
  },
  cameraPlaceholderIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  cameraPlaceholderText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentFrame: {
    width: '80%',
    height: '60%',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 8,
  },
  controls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  flipButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  capturingIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.error,
  },
  placeholderButton: {
    width: 50,
    height: 50,
  },
  instructions: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  instructionsText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  closeButton: {
    padding: 8,
  },
  errorContainer: {
    position: 'absolute',
    bottom: 150,
    left: 20,
    right: 20,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#222',
  },
  permissionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 16,
  },
  permissionButton: {
    minWidth: 200,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  processingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  previewImage: {
    flex: 1,
    resizeMode: 'contain',
  },
  previewOverlay: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 10,
  },
  previewTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  previewInstructions: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  previewControls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  previewButton: {
    flex: 1,
    marginHorizontal: 10,
  },
  webSimulationOverlay: {
    position: 'absolute',
    top: '30%',
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  simulationTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  simulationText: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  rateLimitContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 10,
  },
});