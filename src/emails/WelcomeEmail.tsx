
import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
    Tailwind,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
    name: string;
    loginUrl?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ? process.env.NEXT_PUBLIC_APP_URL : "";

export const WelcomeEmail = ({
    name,
    loginUrl = `${baseUrl}/login`,
}: WelcomeEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Bienvenido a Licitaciones Efectivas</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
                        <Section className="mt-[32px] text-center">
                            {/* You can add a logo here if available */}
                            <Heading className="text-[#0284c7] text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                                Licitaciones <strong>Efectivas</strong>
                            </Heading>
                        </Section>
                        <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                            ¡Bienvenido, {name}!
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Gracias por unirte a <strong>Licitaciones Efectivas</strong>. Estamos emocionados de ayudarte a encontrar y ganar más oportunidades de negocio con el Estado.
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Con nuestra plataforma podrás:
                        </Text>
                        <ul className="text-[14px] leading-[24px] text-black">
                            <li>Encontrar licitaciones relevantes rápidamente.</li>
                            <li>Analizar pliegos con inteligencia artificial.</li>
                            <li>Recibir alertas personalizadas.</li>
                        </ul>
                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Button
                                className="bg-[#0284c7] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                                href={loginUrl}
                            >
                                Ingresar a mi cuenta
                            </Button>
                        </Section>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Si tienes alguna pregunta, no dudes en responder a este correo.
                        </Text>
                        <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
                        <Text className="text-[#666666] text-[12px] leading-[24px]">
                            © {new Date().getFullYear()} Licitaciones Efectivas S.A.S. Todos los derechos reservados.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default WelcomeEmail;
