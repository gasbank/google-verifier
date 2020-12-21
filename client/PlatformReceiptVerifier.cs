using System;
using System.Net.Http;
using System.Threading.Tasks;
using UnityEngine;

public static class PlatformReceiptVerifier {
    static readonly string VERIFIER_URL = "http://localhost/verifyGooglePlay";

    static string Base64Encode(string plainText) {
        var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(plainText);
        return Convert.ToBase64String(plainTextBytes);
    }

    public static async Task<bool> Verify(string receipt) {
        try {
            using (var httpClient = new HttpClient()) {
                httpClient.DefaultRequestHeaders.Add("receipt-to-be-verified", Base64Encode(receipt));
                var getTask = await httpClient.GetAsync(new Uri(VERIFIER_URL));
                if (getTask.IsSuccessStatusCode) {
                    Debug.Log("Receipt verification: OK");
                    return true;
                }

                if (Application.isEditor) {
                    Debug.Log($"Receipt verification: failed. status code={getTask.StatusCode} (ALWAYS FAIL IN EDITOR MODE. NOT AN ERROR)");
                    return true;
                }

                Debug.LogError($"Receipt verification: failed. status code={getTask.StatusCode}");
            }
        } catch (Exception e) {
            Debug.LogError($"Receipt verification: failed with exception. {e}");
        }
        return false;
    }
}