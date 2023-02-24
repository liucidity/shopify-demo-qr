import { Card, Page, Layout, SkeletonBodyText } from '@shopify/polaris';
import { Loading, TitleBar } from "@shopify/app-bridge-react";
import { QRCodeForm } from '../../components/QRCodeForm';

export default function QRCodeEdit() {
  const breadcrumbs = [{content: "QR Codes", url: "/"}];
  /*
    These are mock values.
    Set isLoading to false to preview the page without loading markup.
  */

    const isLoading = false;
    const isRefetching = false;
    const QRCode = {
      createdAt: "2022-06-13",
      destination: "checkout",
      title: "My first QR Code",
      product: {},
    };

  // Loading action and markup that uses App Bridge and Polaris components

  if (isLoading || isRefetching) {
    return (
      <Page>
        <TitleBar
          title='Edit QR Code'
          breadcrumbs={breadcrumbs}
          primaryAction={null}
          />
          <Loading/>
          <Layout>
            <Layout.Section>
              <Card sectioned title="Title">
                <SkeletonBodyText/>
              </Card>

              <Card title="Product">
                <Card.Section>
                  <SkeletonBodyText lines={1}/>
                </Card.Section>
                <Card.Section>
                  <SkeletonBodyText lines={3}/>
                </Card.Section>
              </Card>
              
              <Card sectioned title="Discount">
                <SkeletonBodyText lines={2}/>
              </Card>
            </Layout.Section>

            <Layout.Section>
              <Card sectioned title="QR Code"/>
            </Layout.Section>
          </Layout>
      </Page>
    )
  }

  return(
    <Page>
      <TitleBar
        title='Edit QR code'
        breadcrumbs={breadcrumbs}
        primaryAction={null}
        />
        <QRCodeForm QRCode={QRCode}/>
    </Page>
  )
}