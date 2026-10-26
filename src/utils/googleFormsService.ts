/**
 * Google Forms API Integration Helper
 * Allows creating attendance forms directly in the user's Google account
 * and retrieving participant responses.
 */

export interface GoogleFormCreationResult {
  formId: string;
  responderUri: string;
  editUri: string;
  title: string;
}

export interface GoogleFormResponseItem {
  responseId: string;
  createTime: string;
  lastSubmittedTime: string;
  answers?: Record<string, {
    questionId: string;
    textAnswers?: {
      answers: { value: string }[];
    };
  }>;
}

/**
 * Creates an official Google Form for daily attendance directly via Google Forms API
 */
export async function createOfficialAttendanceGoogleForm(
  accessToken: string,
  title: string = 'Formulir Absensi Harian Peserta',
  agencyName: string = 'Instansi'
): Promise<GoogleFormCreationResult> {
  // Step 1: Create the base form
  const createRes = await fetch('https://forms.googleapis.com/v1/forms', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      info: {
        title: title,
        documentTitle: `${title} - ${agencyName}`,
      },
    }),
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Gagal membuat Google Form: ${createRes.status} - ${errorText}`);
  }

  const formData = await createRes.json();
  const formId = formData.formId;

  // Step 2: Add attendance questions via batchUpdate
  const batchRes = await fetch(`https://forms.googleapis.com/v1/forms/${encodeURIComponent(formId)}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      includeFormInResponse: true,
      requests: [
        {
          createItem: {
            item: {
              title: 'Nomor Induk Pegawai (NIP)',
              description: 'Masukkan NIP tanpa spasi atau dengan format resmi',
              questionItem: {
                question: {
                  required: true,
                  textQuestion: {
                    paragraph: false,
                  },
                },
              },
            },
            location: { index: 0 },
          },
        },
        {
          createItem: {
            item: {
              title: 'Nama Lengkap Beserta Gelar',
              description: 'Nama lengkap yang akan tercetak di bawah foto kolase dokumentasi',
              questionItem: {
                question: {
                  required: true,
                  textQuestion: {
                    paragraph: false,
                  },
                },
              },
            },
            location: { index: 1 },
          },
        },
        {
          createItem: {
            item: {
              title: 'Sesi Absensi',
              description: 'Pilih sesi absensi hari ini',
              questionItem: {
                question: {
                  required: true,
                  choiceQuestion: {
                    type: 'RADIO',
                    options: [
                      { value: 'PAGI (Apel / Masuk Kerja)' },
                      { value: 'SORE (Kepulangan / Selesai Piket)' },
                    ],
                    shuffle: false,
                  },
                },
              },
            },
            location: { index: 2 },
          },
        },
        {
          createItem: {
            item: {
              title: 'Tautan Foto / Dokumentasi Selfie',
              description: 'Unggah foto ke Google Drive publik atau tempel URL foto dokumentasi kehadiran Anda',
              questionItem: {
                question: {
                  required: true,
                  textQuestion: {
                    paragraph: false,
                  },
                },
              },
            },
            location: { index: 3 },
          },
        },
      ],
    }),
  });

  if (!batchRes.ok) {
    const errorBatch = await batchRes.text();
    console.warn('Batch update form failed, form still created:', errorBatch);
  }

  return {
    formId: formData.formId,
    responderUri: formData.responderUri || `https://docs.google.com/forms/d/e/${formData.formId}/viewform`,
    editUri: `https://docs.google.com/forms/d/${formData.formId}/edit`,
    title: formData.info?.title || title,
  };
}

/**
 * Fetch all submitted responses from an existing Google Form
 */
export async function fetchFormResponses(
  accessToken: string,
  formId: string
): Promise<GoogleFormResponseItem[]> {
  const safeFormId = encodeURIComponent(formId.trim());
  const res = await fetch(`https://forms.googleapis.com/v1/forms/${safeFormId}/responses`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gagal mengambil respons formulir: ${res.status} - ${errorText}`);
  }

  const data = await res.json();
  return data.responses || [];
}
