import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomHeader from '@/components/CustomHeader';
import TabBar from '@/components/TabBar';
import Inicio from './index';
import FAQ from './faq';
import Nuevo from './nuevo';
import Historial from './historial';
import Perfil from './Perfil';

const Tab = createBottomTabNavigator();

export default function TabLayout() {
    return (
        <Tab.Navigator
            screenOptions={{
                header: () => <CustomHeader />,
                headerShown: true,
                tabBarActiveTintColor: '#3C6034',
                tabBarInactiveTintColor: '#999999',
            }}
            tabBar={(props) => <TabBar {...props} />}
        >
            <Tab.Screen
                name="index"
                component={Inicio}
                options={{ title: 'Inicio' }}
            />
            <Tab.Screen
                name="faq"
                component={FAQ}
                options={{ title: 'FAQ' }}
            />
            <Tab.Screen
                name="nuevo"
                component={Nuevo}
                options={{ title: 'Nuevo' }}
            />
            <Tab.Screen
                name="historial"
                component={Historial}
                options={{ title: 'Historial' }}
            />
            <Tab.Screen
                name="perfil"
                component={Perfil}
                options={{ title: 'Perfil' }}
            />
        </Tab.Navigator>
    );
}