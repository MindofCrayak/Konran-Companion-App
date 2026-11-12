import { CharacterExportPayload } from '../types/feExport';
import { generate5eCharacterXml } from './feCharacterExporter';

export function trigger5eSheetDownload(character: CharacterExportPayload): void {
  const xmlPayload = generate5eCharacterXml(character);
  const blob = new Blob([xmlPayload], { type: 'application/json' });
  const downloadUrl = URL.createObjectURL(blob);

  const cleanName = (character.name || 'Konran_Hero')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${cleanName}_5eExport.json`;

  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}
