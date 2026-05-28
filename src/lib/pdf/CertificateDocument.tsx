import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  frame: {
    flex: 1,
    borderWidth: 4,
    borderColor: "#E30613",
    padding: 32,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: {
    fontFamily: "Helvetica-Bold",
    fontSize: 22,
    color: "#E30613",
    letterSpacing: 2,
  },
  brandSub: {
    fontSize: 9,
    color: "#5a5a5a",
    letterSpacing: 3,
    marginTop: 2,
  },
  serial: {
    fontSize: 9,
    color: "#5a5a5a",
  },
  center: {
    alignItems: "center",
    marginTop: 30,
  },
  preTitle: {
    fontSize: 11,
    color: "#5a5a5a",
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: "Helvetica-Bold",
    fontSize: 38,
    color: "#111111",
    marginTop: 14,
    textAlign: "center",
  },
  awarded: {
    fontSize: 12,
    color: "#5a5a5a",
    marginTop: 26,
  },
  learner: {
    fontFamily: "Helvetica-Bold",
    fontSize: 30,
    color: "#E30613",
    marginTop: 8,
    textAlign: "center",
  },
  rule: {
    width: 180,
    height: 1,
    backgroundColor: "#cccccc",
    marginTop: 14,
  },
  body: {
    fontSize: 12,
    color: "#333333",
    textAlign: "center",
    marginTop: 22,
    lineHeight: 1.5,
    paddingHorizontal: 40,
  },
  courseTitle: {
    fontFamily: "Helvetica-Bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 30,
  },
  footerCol: {
    flexDirection: "column",
    alignItems: "center",
  },
  signatureLine: {
    width: 160,
    height: 1,
    backgroundColor: "#222222",
  },
  signatureLabel: {
    fontSize: 10,
    color: "#5a5a5a",
    marginTop: 4,
  },
  signatureName: {
    fontSize: 11,
    color: "#111111",
    fontFamily: "Helvetica-Bold",
    marginTop: 2,
  },
});

export type CertificateProps = {
  learnerName: string;
  courseCode: string;
  courseTitle: string;
  vendor: string;
  durationDays: number;
  completedAt: Date;
  serial: string;
};

export function CertificateDocument(p: CertificateProps) {
  const issuedOn = p.completedAt.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <Document
      title={`Certificate — ${p.courseCode}`}
      author="Advancia Training"
      subject="Certificate of Completion"
    >
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.frame}>
          <View style={styles.topBar}>
            <View>
              <Text style={styles.brand}>ADVANCIA</Text>
              <Text style={styles.brandSub}>TRAINING</Text>
            </View>
            <View>
              <Text style={styles.serial}>Serial: {p.serial}</Text>
              <Text style={styles.serial}>Issued: {issuedOn}</Text>
            </View>
          </View>

          <View style={styles.center}>
            <Text style={styles.preTitle}>Certificate of Completion</Text>
            <Text style={styles.title}>{p.courseTitle}</Text>
            <Text style={styles.awarded}>This certificate is proudly awarded to</Text>
            <Text style={styles.learner}>{p.learnerName}</Text>
            <View style={styles.rule} />

            <Text style={styles.body}>
              In recognition of successfully completing the{" "}
              <Text style={styles.courseTitle}>
                {p.vendor} {p.courseCode}
              </Text>{" "}
              {p.durationDays}-day program delivered by Advancia Training, demonstrating
              mastery of the official curriculum.
            </Text>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerCol}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Issued by</Text>
              <Text style={styles.signatureName}>Advancia Training</Text>
            </View>
            <View style={styles.footerCol}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Verify at</Text>
              <Text style={styles.signatureName}>advancia-training.com</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
