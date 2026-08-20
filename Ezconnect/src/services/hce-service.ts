import { HCESession, NFCTagType4, NFCTagType4NDEFContentType } from 'react-native-hce';

let session: HCESession | null = null;

export async function initHceSession() {
  if (!session) {
    session = await HCESession.getInstance();
  }
  return session;
}

export async function startHce(vCardString: string) {
  try {
    const hceSession = await initHceSession();
    
    // Create an NDEF Text record with the vCard content
    const tag = new NFCTagType4({
      type: NFCTagType4NDEFContentType.Text,
      content: vCardString,
      writable: false,
    });
    
    await hceSession.setApplication(tag);
    await hceSession.setEnabled(true);
  } catch (error) {
    console.error('Failed to start HCE', error);
  }
}

export async function stopHce() {
  try {
    const hceSession = await initHceSession();
    await hceSession.setEnabled(false);
  } catch (error) {
    console.error('Failed to stop HCE', error);
  }
}
